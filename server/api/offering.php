<?php
// Copyright 2022 BC Holmes
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This function creates an object representation of offerings and also
// handles reading/writing offerings from the database.

require_once("db_common_functions.php");

class Variant {
    public $id;
    public $name;
    public $description;
    public $suggestedPrice;
    public $isDefault;
    public $minimumPrice;
    public $maximumPrice;

    function asJson() {
        return array("id" => $this->id,
            "name" => $this->name,
            "description" => $this->description,
            "isDefault" => $this->isDefault,
            "suggestedPrice" => $this->suggestedPrice
        );
    }
}

class Offering {

    public $id;
    public $title;
    public $highlights;
    public $currency;
    public $suggestedPrice;
    public $description;
    public $minimumPrice;
    public $maximumPrice;
    public $emailRequired;
    public $isMembership;
    public $emphasis;
    public $addPrompts;
    public $addressRequired;
    public $ageRequired;
    public $isDonation;
    public $isRestricted;
    public $quantityPoolId;
    public $relatedOfferingId;
    public $variants;
    public $quantity;
    public $purchaseCount;
    public $startTime;
    public $endTime;

    function hasRemainingQuantity() {
        if ($this->quantityPoolId === null || $this->quantity === null) {
            return true;
        } else {
            return $this->getRemainingQuantity() > 0;
        }
    }

    function getRemainingQuantity() {
        if ($this->quantityPoolId != null && $this->quantity != null) {
            return $this->quantity - ($this->purchaseCount ? $this->purchaseCount : 0);
        } else {
            return 99999;
        }
    }

    static function findByConAndId($db, $conData, $id) {
        $all = Offering::findAllByCon($db, $conData);

        foreach ($all as $a) {
            if ($a->id === $id) {
                return $a;
            }
        }
        return null;
    }

    static function findAllByCon($db, $conData) {
        $query = <<<EOD
     SELECT
            o.id, o.title, o.minimum_price, o.currency, o.suggested_price, o.maximum_price,
            o.description, o.is_membership, o.add_prompts, o.emphasis, o.email_required, h.highlight_text, o.address_required,
            o.age_required, o.is_donation, o.quantity_pool_id, o.restricted_access, o.related_offering_id, p.quantity,
            o.start_time, o.end_time
       FROM
            reg_offering o
      LEFT OUTER JOIN reg_offering_highlight h
         ON
            o.id = h.offering_id
    LEFT OUTER JOIN reg_quantity_pool p
        ON
            p.id = o.quantity_pool_id
         WHERE
            o.start_time <= NOW()
        AND
            o.end_time >= NOW()
        AND
            o.con_id = ?
        ORDER BY
            o.sort_order, o.id, h.sort_order;
EOD;

        $items = array();
        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $conData->id);
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);

            $item = null;
            $highlight_list = null;
            while ($row = mysqli_fetch_object($result)) {
                if ($item == null || $item->id != $row->id) {
                    if ($item) {
                        array_push($items, $item);
                    }
                    $item = new Offering();
                    $item->id = $row->id;
                    $item->title = $row->title;
                    $item->highlights = array();
                    $item->currency = $row->currency;
                    $item->suggestedPrice = $row->suggested_price == null ? null : (double) $row->suggested_price;
                    $item->description = $row->description;
                    $item->minimumPrice = $row->minimum_price == null ? null : (double) $row->minimum_price;
                    $item->maximumPrice = $row->maximum_price == null ? null : (double) $row->maximum_price;
                    $item->emailRequired = $row->email_required;
                    $item->isMembership = ("Y" == $row->is_membership ? true : false);
                    $item->emphasis = ("Y" == $row->emphasis ? true : false);
                    $item->addPrompts = ("Y" == $row->add_prompts ? true : false);
                    $item->addressRequired = ("Y" == $row->address_required ? true : false);
                    $item->ageRequired = ("Y" == $row->age_required ? true : false);
                    $item->isDonation = ("Y" == $row->is_donation ? true : false);
                    $item->isRestricted = ("Y" == $row->restricted_access ? true : false);
                    $item->quantityPoolId = $row->quantity_pool_id;
                    $item->relatedOfferingId = $row->related_offering_id;
                    $item->quantity = $row->quantity;
                    $item->startTime = convert_database_date_to_date($row->start_time);
                    $item->endTime = convert_database_date_to_date($row->end_time);
                }
                if ($row->highlight_text) {
                    $highlight_list = $item->highlights;
                    array_push($highlight_list, $row->highlight_text);
                    $item->highlights = $highlight_list;
                }
            }
            if ($item) {
                array_push($items, $item);
            }
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("Could not execute query: $query");
        }

        $query = <<<EOD
        SELECT count(i.id) as current_count, p.quantity, p.id as pool_id
        FROM reg_order_item i, reg_order ord, reg_offering of, reg_quantity_pool p
        WHERE i.offering_id = of.id
        AND i.order_id = ord.id
        AND (ord.status in ('PAID', 'CHECKED_OUT') or (ord.status = 'IN_PROGRESS' and timestampdiff(SECOND, ord.last_modified_date, now()) < 600))
        AND of.quantity_pool_id = p.id
        AND ord.con_id = ?
        GROUP BY p.id, p.quantity;
EOD;

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $conData->id);
        $quantities = array();
        if (mysqli_stmt_execute($stmt)) {
            $result = mysqli_stmt_get_result($stmt);

            while ($row = mysqli_fetch_object($result)) {
                $quantities[$row->pool_id] = $row->current_count;
            }
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("Could not execute query: $query");
        }

        $query = <<<EOD
        SELECT v.id, v.sort_order, v.name, v.description, v.is_default, v.offering_id, v.suggested_price
        FROM reg_offering_variant v
        WHERE v.offering_id in (select o.id from reg_offering o where o.con_id = ?)
        ORDER BY v.offering_id, v.sort_order;
EOD;

        $stmt = mysqli_prepare($db, $query);
        mysqli_stmt_bind_param($stmt, "i", $conData->id);
        $variants = array();
        if (mysqli_stmt_execute($stmt)) {
            $resultSet = mysqli_stmt_get_result($stmt);

            while ($row = mysqli_fetch_object($resultSet)) {
                $offeringId = $row->offering_id;
                $temp = array_key_exists($offeringId, $variants) ? $variants[$offeringId] : array();

                $variant = new Variant();
                $variant->id = $row->id;
                $variant->name = $row->name;
                $variant->description = $row->description;
                $variant->isDefault = ("Y" == $row->is_default ? true : false);
                $variant->suggestedPrice = $row->suggested_price == null ? null : (double) $row->suggested_price;
                $temp[] = $variant;

                $variants[$offeringId] = $temp;
            }
            mysqli_stmt_close($stmt);
        } else {
            throw new DatabaseSqlException("Could not execute query: $query");
        }

        foreach ($items as &$item) {
            if ($item->quantityPoolId && array_key_exists($item->quantityPoolId, $quantities)) {
                $item->purchaseCount = $quantities[$item->quantityPoolId];
            }
            $item->variants = array_key_exists($item->id, $variants) ? $variants[$item->id] : array();
        }
        unset($item);

        return $items;
    }

    function asJson() {
        $result = array("id" => $this->id,
            "title" => $this->title,
            "highlights" => $this->highlights,
            "currency" => $this->currency,
            "suggestedPrice" => $this->suggestedPrice,
            "description" => $this->description,
            "minimumPrice" => $this->minimumPrice,
            "maximumPrice" => $this->maximumPrice,
            "emailRequired" => $this->emailRequired,
            "isMembership" => $this->isMembership,
            "emphasis"  => $this->emphasis,
            "addPrompts" => $this->addPrompts,
            "addressRequired" => $this->addressRequired,
            "ageRequired" => $this->ageRequired,
            "isDonation" => $this->isDonation,
            "isRestricted" => $this->isRestricted,
            "relatedOfferingId" => $this->relatedOfferingId
        );

        if ($this->quantityPoolId) {
            $result["quantityPoolId"] = $this->quantityPoolId;
            $result["remaining"] = $this->getRemainingQuantity();
        }

        if ($this->startTime) {
            $result["startTime"] = $this->startTime->format(DateTime::ATOM);
        }

        if ($this->endTime) {
            $result["endTime"] = $this->endTime->format(DateTime::ATOM);
        }

        if ($this->variants != null) {
            $temp = array();
            foreach ($this->variants as $variant) {
                $temp[] = $variant->asJson();
            }
            $result["variants"] = $temp;
        }
        return $result;
    }

    public static function asJsonList($offerings) {
        $result = array();
        foreach ($offerings as $offering) {
            $result[] = $offering->asJson();
        }
        return $result;
    }
}

?>