import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ShopFormService } from "../../services/shop-form.service";
import { Country } from "../../common/country";
import { State } from "../../common/state";
import { ShopValidators } from "../../validators/shop-validators";
import { CartService } from "../../services/cart.service";

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
              private cartService: CartService,
              private formService: ShopFormService) {
  }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        email: new FormControl('',
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
          [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),
    });

    const startMonth: number = new Date().getMonth() + 1;
    this.formService.getMonths(startMonth).subscribe(data => this.creditCardMonths = data);
    this.formService.getYears().subscribe(data => this.creditCardYears = data);
    this.formService.getCountries().subscribe(data => this.countries = data);

    this.reviewCartDetails();
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get("customer")?.value);
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get cardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get cardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get cardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get cardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

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

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(totalPrice => this.totalPrice = totalPrice);
    this.cartService.totalQuantity.subscribe(totalQuantity => this.totalQuantity = totalQuantity);
  }
}
