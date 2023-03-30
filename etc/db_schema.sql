
create table reg_perennial_con_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(90) not null,
    website_url varchar(255) not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_con_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perennial_con_id INT NOT NULL,
    name VARCHAR(90) NOT NULL,
    header_img_name VARCHAR(90),
    active_from_time TIMESTAMP NOT NULL DEFAULT NOW(),
    active_to_time TIMESTAMP NOT NULL DEFAULT NOW(),
    reg_open_time TIMESTAMP NOT NULL DEFAULT NOW(),
    reg_close_time TIMESTAMP NOT NULL DEFAULT NOW(),
    con_start_date DATE NOT NULL,
    con_end_date DATE NOT NULL,
    FOREIGN KEY (perennial_con_id)
        REFERENCES reg_perennial_con_info (id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_offering (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sort_order INT NOT NULL,
    title varchar(255) NOT NULL,
    con_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP NOT NULL DEFAULT NOW(),
    minimum_price decimal(13,2),
    suggested_price decimal(13,2),
    maximum_price decimal(13,2),
    currency char(3) NOT NULL DEFAULT 'USD',
    emphasis char(1) NOT NULL DEFAULT 'N',
    is_membership char(1) NOT NULL DEFAULT 'N',
    add_prompts char(1) NOT NULL DEFAULT 'N',
    email_required varchar(16) NOT NULL DEFAULT 'NO',
    description varchar(2048),

    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_offering_highlight (
    offering_id INT NOT NULL,
    sort_order INT NOT NULL,
    highlight_text varchar(1024),
    PRIMARY KEY(offering_id, sort_order),

    FOREIGN KEY (offering_id)
        REFERENCES reg_offering(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_offering_variant (
    `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    sort_order INT NOT NULL,
    name varchar(1024),
    description varchar(2048),
    is_default char(1) NOT NULL DEFAULT 'N',
    minimum_price decimal(13,2),
    suggested_price decimal(13,2),
    maximum_price decimal(13,2),

    FOREIGN KEY (offering_id)
        REFERENCES reg_offering(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

alter table reg_offering_variant add column related_variant_id int(11);
alter table reg_offering_variant add foreign key (related_variant_id) references reg_offering_variant(id);

insert into reg_perennial_con_info (name, website_url)
values ('WisCon', 'https://wiscon.net');


insert into reg_con_info (name, perennial_con_id, con_start_date, con_end_date)
select 'WisCon 2022', max(id), '2022-05-26', '2022-05-30'
from reg_perennial_con_info;

insert into reg_con_info (name, perennial_con_id, con_start_date, con_end_date, active_from_time, active_to_time, reg_open_time, reg_close_time)
select 'WisCon 2023', max(id), '2023-05-25', '2023-05-29', '2022-06-01 23:39:39', '2023-05-31 23:39:39', '2022-06-01 23:39:39', '2023-05-31 23:39:39'
from reg_perennial_con_info;

insert into reg_con_info (name, perennial_con_id, con_start_date, con_end_date, active_from_time, active_to_time, reg_open_time, reg_close_time)
select 'WisCon 2024', max(id), '2024-05-23', '2024-05-27', '2023-06-01 23:39:39', '2024-05-31 23:39:39', '2023-09-01 23:39:39', '2024-05-31 23:39:39'
from reg_perennial_con_info;


create view reg_users as
SELECT distinct P.badgeid, P.password, C.firstname, C.lastname, C.badgename, C.email
    FROM
                Participants P
        JOIN CongoDump C ON P.badgeid = C.badgeid
         and P.badgeid in
    (select badgeid from
        PermissionRoles PR
        LEFT JOIN UserHasPermissionRole UHPR ON UHPR.permroleid = PR.permroleid
        where PR.permrolename = 'Registration' or PR.permrolename = 'Bookkeeping');


insert into PermissionRoles (permrolename, notes, display_order) values ('Bookkeeping', 'Read-only access to registration system', 38);

create view reg_user_roles as
SELECT badgeid, PR.permrolename as role_name
   from
        PermissionRoles PR
        LEFT JOIN UserHasPermissionRole UHPR ON UHPR.permroleid = PR.permroleid
        where PR.permrolename = 'Registration' or PR.permrolename = 'Bookkeeping';

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(1, 'Former GoH', 1, '2022-05-31 23:59:59', 0.00, 'Available only to previous Guests of Honor.', 'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Available only to previous Guests of Honor'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, emphasis, email_required)
values
(2, 'Adult Membership', 1, '2022-05-31 23:59:59', 65.00,
'Our standard membership for adult guests (anyone 19 or older as of 2022-05-30/Memorial Day, last day of the convention).',
'Y', 'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 19+'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(3, 'Teen Membership', 1, '2022-05-31 23:59:59', 20.00,
'Our weekend membership for teen guests (anyone 13 to 18 as of 2022-05-30/Memorial Day, last day of the convention).',
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 13-18'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(4, 'Youth Membership', 1, '2022-05-31 23:59:59', 20.00,
'Our weekend membership for young guests (anyone 7 to 12 as of 2022-05-30/Memorial Day, last day of the convention).',
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 7-12'
from reg_offering;


insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(5, 'WisCon Child Care', 1, '2022-05-31 23:59:59', 0.00,
'Child Membership (Ages 0-6) for WisCon 45 in May 2022. Includes on-site child care by licensed providers during the day, on each day of the convention (check wiscon.net for details and hours).',
'Y', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'On-site daytime child care by licensed providers (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 0-6'
from reg_offering;


insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(6, 'Supporting Membership', 1, '2022-05-31 23:59:59', 25.00,
'A non-attending membership for the convention. Supporting Members will receive any announcements and mailings sent to the general membership, as well as a physical copy of our program and souvenir book (requires a mailing address).',
'Y', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'A non-attending membership'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Receive printed materials, by mail'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(7, 'Dessert Ticket', 1, '2022-05-31 23:59:59', 35.00,
'Ticket for the Dessert Salon on Sunday evening of WisCon 45 in 2020, including two desserts from the buffet. (Proceeds from the Dessert Salon help to offset the costs of other aspects of the convention.)',
'N', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Sunday Evening Dessert Salon'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Two desserts'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, email_required)
values
(8, 'Donate to Wiscon/SF3', 1, '2022-05-31 23:59:59',
'Thank you for supporting WisCon! Donations in this category will go to the general fund for SF3, WisCon''s parent organization, and will support the convention as well as other SF3 activities.',
'N', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Donations to the general fund for SF3, WisCon''s parent organization'
from reg_offering;


insert into reg_offering
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, email_required)
values
(9, 'Donate to WMAF', 1, '2022-05-31 23:59:59',
'Donations to the WisCon Member Assistance Fund, which supports anyone who needs financial assistance to attend the convention. To learn more, including about how to apply to the Member Assistance Fund yourself, visit https://wiscon.net/assistance-fund/ ',
'N', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'The WisCon Member Assistance Fund supports anyone who needs financial assistance to attend'
from reg_offering;

CREATE TABLE `reg_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(36) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'IN_PROGRESS',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modified_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(32) DEFAULT NULL,
  `con_id` int(11) NOT NULL,
  `finalized_date` timestamp NULL DEFAULT NULL,
  `confirmation_email` varchar(255) DEFAULT NULL,
  `payment_intent_id` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_con_id` (`con_id`),
  CONSTRAINT `fk_order_con_id` FOREIGN KEY (`con_id`) REFERENCES `reg_con_info` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8;

CREATE TABLE `reg_order_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `offering_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `for_name` varchar(255) NOT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `item_uuid` varchar(36) NOT NULL,
  `amount` decimal(13,2) DEFAULT NULL,
  `email_ok` char(1) DEFAULT NULL,
  `volunteer_ok` char(1) DEFAULT NULL,
  `snail_mail_ok` char(1) DEFAULT NULL,
  `street_line_1` varchar(1024) DEFAULT NULL,
  `street_line_2` varchar(1024) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state_or_province` varchar(255) DEFAULT NULL,
  `zip_or_postal_code` varchar(255) DEFAULT NULL,
  `country` varchar(1024) DEFAULT NULL,
  `age` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `offering_id` (`offering_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `reg_order_item_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `reg_offering` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reg_order_item_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `reg_order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8;


alter table reg_offering add column address_required char(1) not null default 'N';

update reg_offering set sort_order = sort_order * 10;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(25, 'Online Membership', 1, '2022-05-31 23:59:59', 40.00,
'The Online Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)',
'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Online Access to Streamed Events'
from reg_offering;

alter table reg_offering add column age_required char(1) not null default 'N';

update reg_offering set age_required = 'Y' where title = 'WisCon Child Care';

alter table reg_order_item add column age varchar(255);

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(27, 'Online Teen Membership', 1, '2022-05-31 23:59:59', 20.00,
'The Online Teen Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)',
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Online Access to Streamed Events'
from reg_offering;

create table reg_program_link (
    con_id int not null,
    order_item_id int not null,
    badgeid varchar(15) not null,

    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
    FOREIGN KEY (order_item_id)
        REFERENCES reg_order_item(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
    FOREIGN KEY (`badgeid`)
        REFERENCES `Participants`(`badgeid`)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

alter table reg_offering add column is_donation char(1) not null default 'N';
alter table reg_offering add column short_name varchar(255);
alter table reg_offering add column quantity_pool_id int;

create table reg_quantity_pool (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `notes` varchar(255),
  PRIMARY KEY (`id`)
);

insert into reg_quantity_pool (quantity, notes) values (200, 'Dessert tickets');
insert into reg_quantity_pool (quantity, notes) values (1000, 'In-person memberships');

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(99, 'Donate Membership to BIPOC Volunteer', 1, '2022-05-31 23:59:59', 65.00,
'In response to feedback from our membership, WisCon/SF3 is working on a variety of antiracism initiatives. One of these involves supporting BIPOC volunteers with complimentary memberships, starting with pre-con volunteers. To support this initiative, you can make a $65 donation to cover the cost of one such membership. Funds that are not disbursed will go towards our overall efforts towards antiracism and affordability.',
'N', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Support BIPOC volunteers with a complimentary membership'
from reg_offering;

alter table reg_offering add column restricted_access char(1) not null default 'N';

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, restricted_access)
values
(100, 'BIPOC Volunteer Membership', 1, '2022-05-31 23:59:59', 0.00,
'Create a membership for a BIPOC volunteer using donated funds',
'Y', 'N', 'YES', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'This is a secret item, covered with a cloak of invisibility'
from reg_offering;

update reg_quantity_pool set quantity = 600 where notes = 'In-person memberships';



insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(22, 'Upgrade Online to In-Person', 1, '2022-05-31 23:59:59', 25.00,
'If you already have an Online Membership, you can upgrade to an In-Person membership by purchasing this item.',
'N', 'N', 'YES');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Upgrade an existing Online Membership'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, restricted_access)
values
(100, 'BIPOC Online Volunteer Membership', 1, '2022-05-31 23:59:59', 0.00,
'Create a membership for a BIPOC volunteer using donated funds',
'Y', 'N', 'YES', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'This is a secret item, covered with a cloak of invisibility'
from reg_offering;

alter table reg_offering add related_offering_id int references reg_offering(`id`);

alter table reg_order_item add orig_offering_id int references reg_offering(`id`);
alter table reg_order_item add `status` varchar(32);

alter table reg_order add orig_order_id int references reg_order(`id`) ON DELETE SET NULL;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, restricted_access)
values
(100, 'Adult Comped Membership', 1, '2022-05-31 23:59:59', 0.00,
'Create a free adult membership using donated funds',
'Y', 'N', 'YES', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'This is a secret item, covered with a cloak of invisibility'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, restricted_access)
values
(100, 'Teen Comped Membership', 1, '2022-05-31 23:59:59', 0.00,
'Create a free teen membership using donated funds',
'Y', 'N', 'YES', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'This is a secret item, covered with a cloak of invisibility'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(24, 'Online Membership (reduced price)', 1, '2022-05-31 23:59:59', 25.00,
'The Online Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)',
'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Access to all online programming and events'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(15, '1-Day Membership (Saturday)', 1, '2022-05-31 23:59:59', 35.00,
'This membership gives you access to all in-person and online programming and events on Saturday.',
'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Saturday events'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 19+'
from reg_offering;


insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(16, '1-Day Membership (Sunday)', 1, '2022-05-31 23:59:59', 30.00,
'This membership gives you access to all in-person and online programming and events on Sunday.',
'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Sunday events'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 19+'
from reg_offering;

alter table reg_order add column `at_door_payment_method` varchar(32) DEFAULT NULL;


insert into reg_offering
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, email_required)
values
(8, 'Donate', 2, '2023-05-31 23:59:59',
'Donations can be used for a variety of purposes. Please choose how you''d like to direct your funds.',
'N', 'N', 'NO');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Donations are always welcome!'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description)
select max(id),
1, 'SF3 General Fund', 'Donations to the general fund for SF3, WisCon''s parent organization'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description)
select max(id),
2, 'WisCon Member Assistance Fund', 'Donations to the WisCon Member Assistance Fund, which supports anyone who needs financial assistance to attend the convention. To learn more, including about how to apply to the Member Assistance Fund yourself, visit https://wiscon.net/assistance-fund/ '
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
3, 'Donate Membership to BIPOC Volunteer',
'A gift in this amount is enough to cover a membership for a BIPOC pre-con volunteer',
65.00
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, minimum_price, suggested_price, description, is_membership, add_prompts, email_required, is_donation)
values
(7, 'Dessert Ticket', 2, '2023-05-29 23:59:59', 20.00, 35.00,
'Ticket for the Dessert Salon on Sunday evening of WisCon 2023, including two desserts from the buffet. (Proceeds from the Dessert Salon help to offset the costs of other aspects of the convention.)',
'N', 'N', 'NO', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Sunday Evening Dessert Salon'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Two desserts'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, age_required)
values
(5, 'WisCon Child Care', 2, '2023-05-29 23:59:59', 1.00,
'Child Membership (Ages 6mo to 6yr) for WisCon 2023. Includes on-site child care during the day, on each day of the convention (check wiscon.net for details and hours).',
'Y', 'N', 'NO', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'On-site daytime child care (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 6mo to 6yr'
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required, address_required)
values
(6, 'Supporting Membership', 2, '2023-05-29 23:59:59', 20.00,
'A non-attending membership for the convention. Supporting Members will receive any announcements and mailings sent to the general membership, as well as a physical copy of our program and souvenir book (requires a mailing address).',
'Y', 'N', 'NO', 'Y');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'A non-attending membership'
from reg_offering;

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Receive printed materials, by mail'
from reg_offering;

alter table reg_order_item add column variant_id int(11);

alter table reg_order_item add FOREIGN KEY (variant_id)
        REFERENCES reg_offering_variant(id)
        ON UPDATE RESTRICT ON DELETE restrict;


insert into reg_offering
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, emphasis, email_required)
values
(2, 'In-Person Membership', 2, '2023-05-29 23:59:59',
'Our standard membership for guests.',
'Y', 'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price, is_default)
select max(id),
1, 'Adult (19+)',
'Our standard membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
65.00, 'Y'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
2, 'Teen/Youth (7-18)',
'Our weekend membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
25.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
3, 'Former GoH',
'Available only to previous Guests of Honor.',
0
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, emphasis, email_required)
values
(2, 'Online Membership', 2, '2023-05-29 23:59:59',
'The Online Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)',
'Y', 'Y', 'N', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Access to all online programming and events'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price, is_default)
select max(id),
1, 'Adult (19+)',
'Our standard membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
25.00, 'Y'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
2, 'Teen/Youth (7-18)',
'Our weekend membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
25.00
from reg_offering;

insert into reg_offering
(sort_order, title, con_id, start_time, end_time, description, is_membership, add_prompts, emphasis, email_required)
values
(2, 'One-Day In-Person Membership', 2, '2023-03-24 05:59:59', '2023-05-29 23:59:59',
'The One-Day Membership provides access to the online portion of WisCon 2023 (visit https://wiscon.net/register/ for more information)',
'Y', 'Y', 'N', 'REQUIRED');

insert into reg_offering_highlight
(offering_id, sort_order, highlight_text)
select max(id),
1, 'One-Day Access to programming and events.'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price, is_default)
select max(id),
1, 'Adult (19+) - Friday only',
'One-day membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
0.00, 'Y'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Adult (19+) - Saturday only',
'One-day membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
35.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Adult (19+) - Sunday only',
'One-day membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
30.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Adult (19+) - Monday only',
'One-day membership for adult guests (anyone 19 or older as of 2023-05-29/Memorial Day, last day of the convention).',
0.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price, is_default)
select max(id),
1, 'Teen (19+) - Friday only',
'One-day membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
0.00, 'Y'
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Teen (19+) - Saturday only',
'One-day membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
10.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Teen (19+) - Sunday only',
'One-day membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
10.00
from reg_offering;

insert into reg_offering_variant
(offering_id, sort_order, name, description, suggested_price)
select max(id),
1, 'Teen (19+) - Monday only',
'One-day membership for teen guests (anyone 7 to 18 as of 2023-05-29/Memorial Day, last day of the convention).',
0.00
from reg_offering;