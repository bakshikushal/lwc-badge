import { LightningElement, api } from 'lwc';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c'
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name'
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const SUCCESS_TITLE='Review Created';
const SUCCESS_VARIANT='success';
export default class BoatAddReviewForm extends LightningElement {
  // Private
  boatId;
  rating;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField        = NAME_FIELD;
  commentField     = COMMENT_FIELD;
  labelSubject = 'Review Subject';
  labelRating  = 'Rating';
  
  // Public Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId() { 
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
  }
  
  // Gets user rating input from stars component
  handleRatingChanged(event) { 
    this.rating = event.detail.rating;
  }
  
  handleSubmit(event) { 
    event.preventDefault();
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);
  }
  
  // Dispatches event when a review is created
  handleSuccess(event) {
    // TODO: dispatch the custom event and show the success message
    this.dispatchEvent(new ShowToastEvent({
        title: SUCCESS_TITLE,
        message: `Review Creates Successfully: Record ID ${event.detail.id}`,
        variant: SUCCESS_VARIANT
    }));
    this.dispatchEvent(new CustomEvent('createreview'));

    this.handleReset();

  }
  
  handleReset() { 
    const inputs = this.template.querySelectorAll('lightning-input-field');
    if(inputs){
        inputs.forEach((elem)=> elem.reset());
    }
  }
}
