import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue} from "lightning/uiRecordApi";
import { NavigationMixin } from 'lightning/navigation';
// Custom Labels Imports
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import labelDetails from '@salesforce/label/c.Details';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelReviews from '@salesforce/label/c.Reviews';
import BOAT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
// import BOAT_LENGTH_FIELD from '@salesforce/schema/Boat__c.Length__c';
// import BOAT_PRICE_FIELD from '@salesforce/schema/Boat__c.Price__c';
// import BOAT_DESC_FIELD from '@salesforce/schema/Boat__c.Description__c';
// import BOAT_TYPE_FIELD from '@salesforce/schema/Boat__c.BoatType__r.Name';
import {
  APPLICATION_SCOPE,
  createMessageContext,
  MessageContext,
  publish,
  releaseMessageContext,
  subscribe,
  unsubscribe
} from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";


const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  @wire(MessageContext)
  messageContext;

 @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;
  // wiredBoat({ error, data }) {
  //   // Error handling
  //   console.log("GETRECORD DATA BOATDETAILS TAB : ", data);
  //   if (data) {
  //     this.wiredRecord = data
  //     console.log("BOATDETAILS TAB : this.wiredRecord",JSON.stringify(this.wiredRecord));
      
  //   } else if (error) {
  //     console.log('ERROR RECEIVED FROM WIRE SERVICE GET RECORD FOR BOAT ID: ',this.boatId);
  //   }
  // }

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
    return this.wiredRecord.data? 'utility:anchor' : '';
  }
  
  // // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return this.wiredRecord.data ? getFieldValue(this.wiredRecord.data,BOAT_NAME_FIELD) : 'TEST BOAT NAME';
   }
  
  // // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (result) => {
          this.boatId = result.recordId;
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }
  
  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
   }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
      console.log('YOU WILL BE REDIRECTED-------------');
      this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              actionName: "view",
              recordId: this.boatId,
              objectApiName: "Boat__c"
          }
      });
  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated(event) { 
    this.template.querySelector('c-boat-reviews').refresh();
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
  }
}
