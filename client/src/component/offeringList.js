import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/esm/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { addToCart } from '../state/cartActions';
import store from '../state/store';
import { fetchOfferings } from '../state/offeringActions';
import { isValidEmail } from '../util/emailUtil';
import { formatAmount } from '../util/numberUtil';
import { serverUrl } from '../util/sdlcUtil';

class OfferingList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            offerings: store.getState().offerings
        }
    }

    componentDidMount() {
        if (this.state.offerings.loading) {
            fetchOfferings();
        }

        this.unsubscribe = store.subscribe(() => {
            let state = this.state;
            this.setState({
                ...state,
                offerings: store.getState().offerings
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        if (this.state.offerings.loading) {
            return (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            );
        } else {

            let offeringList = this.state.offerings.items.map((o) => {
                let highlights = o.highlights.map((h, i) => {
                    return (<li key={o.id.toString + "-" + i.toString()}>{h}</li>)
                })
                let price = o.suggestedPrice === undefined || o.suggestedPrice === null ? 'Any' : (o.suggestedPrice ===  0 ? 'Free' : ('$' + o.suggestedPrice.toFixed(0)));
                let priceSuffix = this.isVariableAmount(o) ? (<small className="text-muted">+/-</small>) : undefined;

                if (o.emphasis) {
                    return (
                        <div className="col" key={'offering-' + o.id}>
                            <div className="card mb-4 rounded-3 shadow-sm border-primary">
                            <div className="card-header py-3 bg-primary text-white">
                                <h5 className="my-0 fw-normal">{o.title}</h5>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price } {priceSuffix}</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) }>Add to cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className="col" key={'offering-' + o.id}>
                            <div className="card mb-4 rounded-3 shadow-sm">
                            <div className="card-header py-3">
                                <h5 className="my-0 fw-normal">{o.title}</h5>
                            </div>
                            <div className="card-body">
                                <h1 className="card-title pricing-card-title"><small className="text-muted fw-light"><small>{o.currency}</small></small> {price } {priceSuffix}</h1>
                                <ul className="list-unstyled mt-3 mb-4">
                                {highlights}
                                </ul>
                                <Button size="lg" className="w-100" onClick={()  => this.showModal(o) } variant="outline-primary">Add to cart</Button>
                            </div>
                            </div>
                        </div>
                    )
                }
            });

            let title = this.state.selectedOffering ? this.state.selectedOffering.title : undefined;
            let description = this.state.selectedOffering ? (<p>{this.state.selectedOffering.description}</p>) : undefined;

            let message = this.state.messages ? this.state.messages.map((e, i)  => {
                return (<Alert variant="danger" key={i}>{e}</Alert>); } ) : undefined;
            let emailLabel = "Email address";
            if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'OPTIONAL') {
                emailLabel = "Email address (optional)"
            }
            let emailOption =  (<Form.Group controlId="formEmail" key="email-field">
                <Form.Label className="sr-only">{emailLabel}</Form.Label>
                <Form.Control type="email" placeholder={emailLabel} onChange={(e) => this.setFormValue("email", e.target.value)}/>
                <Form.Text className="text-muted">
                    Provide a current email address to which information about this membership and the upcoming WisCon convention can be 
                    sent. This email will not be used or shared for any other purpose without your consent. (If you are also 
                    signing up for WisCon programming, please provide the same email address here so that we can match your profiles.)
                </Form.Text>
            </Form.Group>);

            if (this.state.selectedOffering && this.state.selectedOffering.emailRequired === 'NO') {
                emailOption = undefined;
            }

            let amountEntry = undefined;
            if (this.state.selectedOffering && this.state.selectedOffering.suggestedPrice == null) {
                amountEntry = (<Form.Group className="mb-3" controlId="amount">
                    <Form.Label className="sr-only">Name</Form.Label>
                    <Form.Control type="number" placeholder="Amount... (e.g. 30)" value={this.getFormValue('amount')} onChange={(e) => this.setFormValue("amount", e.target.value)}/>
                    <Form.Text className="text-muted">
                        Please choose the amount you wish provide for this item.
                    </Form.Text>
                </Form.Group>);
            } else if (this.isVariableAmount(this.state.selectedOffering)) {
                amountEntry = (<Form.Group className="mb-3" controlId="amount">
                    <Form.Label className="sr-only">Name</Form.Label>
                    <Form.Control type="number" placeholder="Amount... (e.g. 30)" value={this.getFormValue('amount')} onChange={(e) => this.setFormValue("amount", e.target.value)}/>
                    <Form.Text className="text-muted">
                        The suggested price for this item ({this.state.selectedOffering.title}) is {formatAmount(this.state.selectedOffering.suggestedPrice, this.state.selectedOffering.currency)}.
                        Please choose an amount between {formatAmount(this.state.selectedOffering.minimumPrice, this.state.selectedOffering.currency)} and {formatAmount(this.state.selectedOffering.maximumPrice, this.state.selectedOffering.currency)}.
                    </Form.Text>
                </Form.Group>);
            }

            let questions = (this.state.selectedOffering && this.state.selectedOffering.addPrompts) 
                ? [
                    <Form.Check className="mb-3" id="volunteer" key="form-volunteer" onClick={(e) => this.setFormValue('volunteer', e.target.checked)}
                            label="WisCon is entirely run by volunteers. Would you like to receive information about volunteering during the upcoming WisCon convention, or about getting involved in pre-convention organizing?" />,
                    <Form.Check id="newsletter"  key="form-newsletter" onClick={(e) => this.setFormValue('newsletter', e.target.checked)}
                            label="Would you like to subscribe by email to the WisCon / SF3 Newsletter, with updates about future WisCons and other SF3 events and activities?" />,
                    <Form.Text className="text-muted mb-3 ml-4" key="form-newsletter-text">
                            See more information <a href="https://wiscon.net/news/e-newsletter/" target="_blank" rel="noreferrer">here</a>
                    </Form.Text>,
                    <Form.Check className="mb-3" id="snailMail" key="form-snailmail" onClick={(e) => this.setFormValue('snailMail', e.target.checked)}
                            label="Would you like to receive annual reminder postcards by physical mail? (Requires a mailing address)" />
                ]
                : undefined;


            let addressFields = (this.isAddressRequired()) 
                ? [
                    <Form.Group controlId="streetLine1" key="streetLine1">
                        <Form.Label className="sr-only">Street Line 1</Form.Label>
                        <Form.Control type="text" placeholder="Street line 1" value={this.getFormValue('streetLine1')} onChange={(e) => this.setFormValue("streetLine1", e.target.value)}/>
                    </Form.Group>,
                    <Form.Group controlId="streetLine2" key="streetLine2">
                        <Form.Label className="sr-only">Street Line 2 (Optional)</Form.Label>
                        <Form.Control type="text" placeholder="Street line 2 (optional)" value={this.getFormValue('streetLine2')} onChange={(e) => this.setFormValue("streetLine2", e.target.value)}/>
                    </Form.Group>,
                    <div className="row" key="cityAndStateProvince">
                        <div className="col-md-4">
                            <Form.Group controlId="city">
                                <Form.Label className="sr-only">City</Form.Label>
                                <Form.Control type="text" placeholder="City" value={this.getFormValue('city')} onChange={(e) => this.setFormValue("city", e.target.value)}/>
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group controlId="stateOrProvince">
                                <Form.Label className="sr-only">State/Province</Form.Label>
                                <Form.Control type="text" placeholder="State or province" value={this.getFormValue('stateOrProvince')} onChange={(e) => this.setFormValue("stateOrProvince", e.target.value)}/>
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group controlId="zipOrPostalCode">
                                <Form.Label className="sr-only">Zip/Postal Code</Form.Label>
                                <Form.Control type="text" placeholder="Zip or postal code" value={this.getFormValue('zipOrPostalCode')} onChange={(e) => this.setFormValue("zipOrPostalCode", e.target.value)}/>
                            </Form.Group>
                        </div>
                    </div>,
                    <Form.Control as="select" value={this.getFormValue('country')} onChange={(e) => this.setFormValue("country", e.target.value)} key="country">
                        <option>Afghanistan</option>
                        <option>Aland Islands</option>
                        <option>Albania</option>
                        <option>Algeria</option>
                        <option>American Samoa</option>
                        <option>Andorra</option>
                        <option>Angola</option>
                        <option>Anguilla</option>
                        <option>Antarctica</option>
                        <option>Antigua and Barbuda</option>
                        <option>Argentina</option>
                        <option>Armenia</option>
                        <option>Aruba</option>
                        <option>Australia</option>
                        <option>Austria</option>
                        <option>Azerbaijan</option>
                        <option>Bahamas</option>
                        <option>Bahrain</option>
                        <option>Bangladesh</option>
                        <option>Barbados</option>
                        <option>Belarus</option>
                        <option>Belgium</option>
                        <option>Belize</option>
                        <option>Benin</option>
                        <option>Bermuda</option>
                        <option>Bhutan</option>
                        <option>Bolivia</option>
                        <option>Bonaire, Sint Eustatius and Saba</option>
                        <option>Bosnia and Herzegovina</option>
                        <option>Botswana</option>
                        <option>Bouvet Island</option>
                        <option>Brazil</option>
                        <option>British Indian Ocean Territory</option>
                        <option>Brunei Darussalam</option>
                        <option>Bulgaria</option>
                        <option>Burkina Faso</option>
                        <option>Burundi</option>
                        <option>Cambodia</option>
                        <option>Cameroon</option>
                        <option>Canada</option>
                        <option>Cape Verde</option>
                        <option>Cayman Islands</option>
                        <option>Central African Republic</option>
                        <option>Chad</option>
                        <option>Chile</option>
                        <option>China</option>
                        <option>Christmas Island</option>
                        <option>Cocos (Keeling) Islands</option>
                        <option>Colombia</option>
                        <option>Comoros</option>
                        <option>Congo</option>
                        <option>Congo, Democratic Republic of the Congo</option>
                        <option>Cook Islands</option>
                        <option>Costa Rica</option>
                        <option>Cote D'Ivoire</option>
                        <option>Croatia</option>
                        <option>Cuba</option>
                        <option>Curacao</option>
                        <option>Cyprus</option>
                        <option>Czech Republic</option>
                        <option>Denmark</option>
                        <option>Djibouti</option>
                        <option>Dominica</option>
                        <option>Dominican Republic</option>
                        <option>Ecuador</option>
                        <option>Egypt</option>
                        <option>El Salvador</option>
                        <option>Equatorial Guinea</option>
                        <option>Eritrea</option>
                        <option>Estonia</option>
                        <option>Ethiopia</option>
                        <option>Falkland Islands (Malvinas)</option>
                        <option>Faroe Islands</option>
                        <option>Fiji</option>
                        <option>Finland</option>
                        <option>France</option>
                        <option>French Guiana</option>
                        <option>French Polynesia</option>
                        <option>French Southern Territories</option>
                        <option>Gabon</option>
                        <option>Gambia</option>
                        <option>Georgia</option>
                        <option>Germany</option>
                        <option>Ghana</option>
                        <option>Gibraltar</option>
                        <option>Greece</option>
                        <option>Greenland</option>
                        <option>Grenada</option>
                        <option>Guadeloupe</option>
                        <option>Guam</option>
                        <option>Guatemala</option>
                        <option>Guernsey</option>
                        <option>Guinea</option>
                        <option>Guinea-Bissau</option>
                        <option>Guyana</option>
                        <option>Haiti</option>
                        <option>Heard Island and Mcdonald Islands</option>
                        <option>Holy See (Vatican City State)</option>
                        <option>Honduras</option>
                        <option>Hong Kong</option>
                        <option>Hungary</option>
                        <option>Iceland</option>
                        <option>India</option>
                        <option>Indonesia</option>
                        <option>Iran, Islamic Republic of</option>
                        <option>Iraq</option>
                        <option>Ireland</option>
                        <option>Isle of Man</option>
                        <option>Israel</option>
                        <option>Italy</option>
                        <option>Jamaica</option>
                        <option>Japan</option>
                        <option>Jersey</option>
                        <option>Jordan</option>
                        <option>Kazakhstan</option>
                        <option>Kenya</option>
                        <option>Kiribati</option>
                        <option>Korea, Democratic People's Republic of</option>
                        <option>Korea, Republic of</option>
                        <option>Kosovo</option>
                        <option>Kuwait</option>
                        <option>Kyrgyzstan</option>
                        <option>Lao People's Democratic Republic</option>
                        <option>Latvia</option>
                        <option>Lebanon</option>
                        <option>Lesotho</option>
                        <option>Liberia</option>
                        <option>Libyan Arab Jamahiriya</option>
                        <option>Liechtenstein</option>
                        <option>Lithuania</option>
                        <option>Luxembourg</option>
                        <option>Macao</option>
                        <option>Macedonia, the Former Yugoslav Republic of</option>
                        <option>Madagascar</option>
                        <option>Malawi</option>
                        <option>Malaysia</option>
                        <option>Maldives</option>
                        <option>Mali</option>
                        <option>Malta</option>
                        <option>Marshall Islands</option>
                        <option>Martinique</option>
                        <option>Mauritania</option>
                        <option>Mauritius</option>
                        <option>Mayotte</option>
                        <option>Mexico</option>
                        <option>Micronesia, Federated States of</option>
                        <option>Moldova, Republic of</option>
                        <option>Monaco</option>
                        <option>Mongolia</option>
                        <option>Montenegro</option>
                        <option>Montserrat</option>
                        <option>Morocco</option>
                        <option>Mozambique</option>
                        <option>Myanmar</option>
                        <option>Namibia</option>
                        <option>Nauru</option>
                        <option>Nepal</option>
                        <option>Netherlands</option>
                        <option>Netherlands Antilles</option>
                        <option>New Caledonia</option>
                        <option>New Zealand</option>
                        <option>Nicaragua</option>
                        <option>Niger</option>
                        <option>Nigeria</option>
                        <option>Niue</option>
                        <option>Norfolk Island</option>
                        <option>Northern Mariana Islands</option>
                        <option>Norway</option>
                        <option>Oman</option>
                        <option>Pakistan</option>
                        <option>Palau</option>
                        <option>Palestinian Territory, Occupied</option>
                        <option>Panama</option>
                        <option>Papua New Guinea</option>
                        <option>Paraguay</option>
                        <option>Peru</option>
                        <option>Philippines</option>
                        <option>Pitcairn</option>
                        <option>Poland</option>
                        <option>Portugal</option>
                        <option>Puerto Rico</option>
                        <option>Qatar</option>
                        <option>Reunion</option>
                        <option>Romania</option>
                        <option>Russian Federation</option>
                        <option>Rwanda</option>
                        <option>Saint Barthelemy</option>
                        <option>Saint Helena</option>
                        <option>Saint Kitts and Nevis</option>
                        <option>Saint Lucia</option>
                        <option>Saint Martin</option>
                        <option>Saint Pierre and Miquelon</option>
                        <option>Saint Vincent and the Grenadines</option>
                        <option>Samoa</option>
                        <option>San Marino</option>
                        <option>Sao Tome and Principe</option>
                        <option>Saudi Arabia</option>
                        <option>Senegal</option>
                        <option>Serbia</option>
                        <option>Serbia and Montenegro</option>
                        <option>Seychelles</option>
                        <option>Sierra Leone</option>
                        <option>Singapore</option>
                        <option>Sint Maarten</option>
                        <option>Slovakia</option>
                        <option>Slovenia</option>
                        <option>Solomon Islands</option>
                        <option>Somalia</option>
                        <option>South Africa</option>
                        <option>South Georgia and the South Sandwich Islands</option>
                        <option>South Sudan</option>
                        <option>Spain</option>
                        <option>Sri Lanka</option>
                        <option>Sudan</option>
                        <option>Suriname</option>
                        <option>Svalbard and Jan Mayen</option>
                        <option>Swaziland</option>
                        <option>Sweden</option>
                        <option>Switzerland</option>
                        <option>Syrian Arab Republic</option>
                        <option>Taiwan, Province of China</option>
                        <option>Tajikistan</option>
                        <option>Tanzania, United Republic of</option>
                        <option>Thailand</option>
                        <option>Timor-Leste</option>
                        <option>Togo</option>
                        <option>Tokelau</option>
                        <option>Tonga</option>
                        <option>Trinidad and Tobago</option>
                        <option>Tunisia</option>
                        <option>Turkey</option>
                        <option>Turkmenistan</option>
                        <option>Turks and Caicos Islands</option>
                        <option>Tuvalu</option>
                        <option>Uganda</option>
                        <option>Ukraine</option>
                        <option>United Arab Emirates</option>
                        <option>United Kingdom</option>
                        <option>United States</option>
                        <option>United States Minor Outlying Islands</option>
                        <option>Uruguay</option>
                        <option>Uzbekistan</option>
                        <option>Vanuatu</option>
                        <option>Venezuela</option>
                        <option>Viet Nam</option>
                        <option>Virgin Islands, British</option>
                        <option>Virgin Islands, U.s.</option>
                        <option>Wallis and Futuna</option>
                        <option>Western Sahara</option>
                        <option>Yemen</option>
                        <option>Zambia</option>
                        <option>Zimbabwe</option>
                    </Form.Control>
            ] 
                : undefined;

            return (
                <div>
                    <p>Select from the following options.</p>
                    <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                        {offeringList}
                    </div>
                    <Modal show={this.state.showModal}  onHide={() => this.handleClose()} size="lg">
                        <Form>
                            <Modal.Header closeButton>
                                <Modal.Title>{title}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {message}
                                {description}
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label className="sr-only">Name</Form.Label>
                                    <Form.Control type="text" placeholder="Name" value={this.getFormValue('for')} onChange={(e) => this.setFormValue("for", e.target.value)}/>
                                    <Form.Text className="text-muted">
                                        Please provide the full name of the person associated with this membership/item. 
                                        This name will appear on your badge, and does not need to be a wallet name.
                                    </Form.Text>

                                </Form.Group>
                                {emailOption}
                                {amountEntry}

                                {questions}
                                {addressFields}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={() => this.addItem()}>
                                    Add to cart
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </div>
            );
        }
    }

    isAddressRequired() {
        let offering = this.state.selectedOffering;
        if (offering) {
            return offering.addressRequired || this.state.values['snailMail'];
        } else {
            return false;
        }
    }

    isVariableAmount(offering) {
        if (offering) {
            return offering.minimumPrice && offering.maximumPrice;
        } else {
            return false;
        }
    }

    getFormValue(formName) {
        if (this.state.values) {
            return this.state.values[formName] || '';
        } else {
            return '';
        }
    }

    setFormValue(formName, formValue) {
        let state = this.state;
        let value = state.values;
        let newValue = { ...value };
        newValue[formName] = formValue;
        this.setState({
            ...state,
            values: newValue,
            messages: null
        });

    }

    isValidForm() {
        return this.validateForm().length === 0;
    }

    toNumber(value) {
        let n = Number(value);
        if (isNaN(n)) {
            return 0;
        } else {
            return n;
        }
    }

    validateForm() {
        let messages = [];
        let offering = this.state.selectedOffering;
        let values = this.state.values;
        if (!values.for) {
            messages.push("Please provide a name.");
        }
        if (offering.emailRequired === 'REQUIRED' && (!values.email || !isValidEmail(values.email))) {
            messages.push("Please provide a valid email.");
        } else if (values.email && !isValidEmail(values.email)) {
            messages.push("That email doesn't look quite right.");
        }
        if (values.amount && !/^(\d*(\.\d{2})?)$/.test(values.amount)) {
            messages.push("The amount value looks a bit fishy");
        } else if (values.amount === '' || (values.amount === 0 && offering.suggestedPrice == null)) {
            messages.push("Please provide an amount.");
        } else if (this.isVariableAmount(offering) && values.amount < offering.minimumPrice) {
            messages.push("The minimum amount is " + offering.currency + " " + formatAmount(offering.minimumPrice, offering.currency));
        } else if (this.isVariableAmount(offering) && values.amount > offering.maximumPrice) {
            messages.push("The maximum amount is " + offering.currency + " " + formatAmount(offering.maximumPrice, offering.currency));
        }

        if (this.isAddressRequired()) {
            if (!values.streetLine1) {
                messages.push("Please provide a valid address");
            }
            if (!values.city) {
                messages.push("Surely your address must have a city.");
            }
            if (!values.stateOrProvince && (values.country === 'United States' || values.country === 'Canada')) {
                messages.push("State and/or province is missing.");
            }
            if (!values.zipOrPostalCode && (values.country === 'United States' || values.country === 'Canada')) {
                messages.push("Zip or postal code is missing.");
            }
        }
        return messages;
    }

    showModal(offering) {
        let value = {};
        if (!offering.isMembership) {
            let items = store.getState().cart.items;
            if (items && items.length > 0) {
                let lastItem = items[items.length-1];
                value['for'] = lastItem.for;
            }
        }
        value.amount = offering.suggestedPrice || 0;
        if (offering.suggestedPrice == null) {
            value.amount = '';
        }
        value.country = 'United States';
        this.setState({
            ...this.state,
            showModal: true,
            selectedOffering: offering,
            values: value,
            messages: null
        });
    }

    addItem() {
        let offering = this.state.selectedOffering;
        let values = this.state.values;
        let uuid = uuidv4();
        let newValues = {
            ...values,
            amount: this.toNumber(values.amount)
        }
        let price = newValues.amount || 0;
        if (this.isValidForm()) {
            axios.post(serverUrl('/api/order_item.php'), {
                "orderId": store.getState().cart.orderId,
                "for": values.for,
                "itemUUID": uuid,
                "offering": offering,
                "values": newValues
            })
            .then(res => {
                store.dispatch(addToCart(offering, values.for, newValues, uuid, price));
                this.setState({
                    ...this.state,
                    showModal: false,
                    selectedOffering: null,
                    values: null,
                    messages: null
                });
                })
            .catch(error => {
                    this.setState({
                        ...this.state,
                        messages: "Sorry. There was a probably talking to the server. Try again?"
                    });
                });

        } else {
            this.setState({
                ...this.state,
                messages: this.validateForm()
            });
        }
    }


    handleClose() {
        this.setState({
            ...this.state,
            showModal: false
        });
    }
}

export default OfferingList;