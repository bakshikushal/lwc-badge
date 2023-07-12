import { LightningElement, wire, api } from 'lwc'
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { APPLICATION_SCOPE, createMessageContext, MessageContext, publish, releaseMessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import Name from '@salesforce/schema/Account.Name';
/* https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_salesforce_modules */

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
const COLS =[
    {label:'Name', fieldName:'Name', type:'text',editable: true},
    {label:'Length', fieldName:'Length__c', type:'Number',editable: true},
    {label:'Price', fieldName:'Price__c', type:'Number',editable: true},
    {label:'Description', fieldName:'Description__c', type:'text',editable: true}
]
export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = COLS;
    @api
    boatTypeId = '';
    boats;
    isLoading = false;
    draftValues=[]
    response

    // wired message context
    @wire(MessageContext)
    messageContext

    // wired getBoats method 
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        console.log('GOT WIRED DATA LOADING : ',result);
        this.boats = result;
        if (result.data) {
            this.response = result.data;
            this.notifyLoading(false);
        }
        if (result.error) {
            this.notifyLoading(false);
        }
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        console.log('SETTING BOATTYPE ID : ',boatTypeId);
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
        this.notifyLoading(false);
     }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.notifyLoading(true);
        console.log('About refresh apex')
        await refreshApex(this.boats)
        this.notifyLoading(false);


     }

    // this function must update selectedBoatId and call sendMessageService
    // updateSelectedTile(event) {
    //     // console.log(`Received custom event in boat serach results for Boat ID: ${event.detail.boatId}`)
    //     this.selectedBoatId = event.detail.boatId;
    //     this.sendMessageService(this.selectedBoatId);
    // }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // console.log(`in the boat search results component to publish lms message: ${this.selectedBoatId}`)
        // explicitly pass boatId to the parameter recordId
        const payload = { recordId: boatId };
        console.log('$$$$$ PUBLISH MESSAGE: ',boatId);
        publish(this.messageContext, BoatMC, payload);
        // console.log(`in the boat search results component MS PUBLISHED: ${this.selectedBoatId}`)

    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        console.log('In the draft Values');
        console.log(event.detail.draftValues[0]);
        // notify loading
        const updatedFields = event.detail.draftValues;
        console.log(updatedFields)
        // Update the records via Apex
        updateBoatList({ data: updatedFields })
            .then((result) => { 
                 console.log(`Result From APEX: ${result}`);
                 this.dispatchEvent(new ShowToastEvent({
                     title: SUCCESS_TITLE,
                     message: MESSAGE_SHIP_IT,
                     variant: SUCCESS_VARIANT
                 }));
                 this.refresh();
            })
            .catch(error => { 
                 console.log(`Error From APEX: ${error}`);
                 this.dispatchEvent(new ShowToastEvent({
                     title: ERROR_TITLE,
                     message: error,
                     variant: ERROR_VARIANT
                 })); 
            })
            .finally(() => { 
                  this.draftValues=[]; 

            });
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) { 
        if(isLoading){
            this.dispatchEvent(new CustomEvent('loading'));
        }
        else{
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }
}
