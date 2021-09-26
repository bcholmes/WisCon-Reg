import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class OfferingList extends Component {

    offerings = [
        {
            title: "Former GoH",
            currency: "USD",
            suggestedPrice: 0,
            emphasis: false,
            highlights: [ "Available to previous Guests of Honor" ]
        },
        {
            title: "Adult Membership",
            currency: "USD",
            suggestedPrice: 65.00,
            emphasis: true,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 19+" ]
        },
        {
            title: "Teen Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 13-18" ]
        },
        {
            title: "Youth Membership",
            currency: "USD",
            suggestedPrice: 20.00,
            emphasis: false,
            highlights: [ "Full Weekend (Thu-Mon)", "Ages 7-12" ]
        },
        {
            title: "Wiscon Child Care",
            currency: "USD",
            suggestedPrice: 0.00,
            emphasis: false,
            highlights: [ "On-site daytime child care by licensed providers (Thu-Mon)", "Ages 0-6" ]
        },
        {
            title: "Supporting Membership",
            currency: "USD",
            suggestedPrice: 25.00,
            emphasis: false,
            highlights: [ "A non-attending membership", "Receive printed materials, by mail" ]
        },
        {
            title: "Dessert Ticket",
            currency: "USD",
            suggestedPrice: 35.00,
            emphasis: false,
            highlights: [ "Sunday Evening Dessert Salon", "Two desserts" ]
        },
        {
            title: "Donate to Wiscon/SF3",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "Donations to the general fund for SF3, WisCon's parent organization." ]
        },
        {
            title: "Donate to WMAF",
            currency: "USD",
            suggestedPrice: undefined,
            emphasis: false,
            highlights: [ "The WisCon Member Assistance Fund supports anyone who needs financial assistance to attend" ]
        }
    ]


    render() {
        let offeringList = this.offerings.map((o) => {
            let highlights = o.highlights.map((h) => {
                return (<li>{h}</li>)
            })
            let price = o.suggestedPrice === undefined || o.suggestedPrice === null ? 'Any' : (o.suggestedPrice ===  0 ? 'Free' : ('$' + o.suggestedPrice.toFixed(0)));

            if (o.emphasis) {
                return (
                    <div class="col">
                        <div class="card mb-4 rounded-3 shadow-sm border-primary">
                        <div class="card-header py-3 bg-primary text-white">
                            <h5 class="my-0 fw-normal">{o.title}</h5>
                        </div>
                        <div class="card-body">
                            <h1 class="card-title pricing-card-title"><small class="text-muted fw-light"><small>{o.currency}</small></small> {price }</h1>
                            <ul class="list-unstyled mt-3 mb-4">
                            {highlights}
                            </ul>
                            <Button size="lg" className="w-100" onClick={()  => this.addItem(o) }>Add to Cart</Button>
                        </div>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div class="col">
                        <div class="card mb-4 rounded-3 shadow-sm">
                        <div class="card-header py-3">
                            <h5 class="my-0 fw-normal">{o.title}</h5>
                        </div>
                        <div class="card-body">
                            <h1 class="card-title pricing-card-title"><small class="text-muted fw-light"><small>{o.currency}</small></small> {price }</h1>
                            <ul class="list-unstyled mt-3 mb-4">
                            {highlights}
                            </ul>
                            <Button size="lg" className="w-100" onClick={()  => this.addItem(o) } variant="outline-primary">Add to Cart</Button>
                        </div>
                        </div>
                    </div>
                )
            }
        });

        return [
            <div>
                <p>Select your membership type.</p>
            </div>,
            <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                {offeringList}
            </div>
        ]
    }

    addItem(offering) {
        console.log('--->' + offering.title);
    }
}

export default OfferingList;