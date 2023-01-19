import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ShopFormService } from "../../services/shop-form.service";
import { Country } from "../../common/country";
import { State } from "../../common/state";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  totalQuantity: number = 0;
  totalPrice: number = 0.00;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private formService: ShopFormService) {
  }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      }),
    });

    const startMonth: number = new Date().getMonth() + 1;
    this.formService.getMonths(startMonth).subscribe(data => this.creditCardMonths = data);
    this.formService.getYears().subscribe(data => this.creditCardYears = data);
    this.formService.getCountries().subscribe(data => this.countries = data);
  }

  onSubmit() {
    console.log(this.checkoutFormGroup.get("customer")?.value);
  }

  copyShippingToBillingAddress(event: any) {
    if (event.target?.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingStates = this.shippingStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingStates = [];
    }
  }

  handleCreditCardDate() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.formService.getMonths(startMonth).subscribe(data => this.creditCardMonths = data)
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingStates = data;
        } else {
          this.billingStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }
}
