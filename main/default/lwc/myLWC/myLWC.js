import { LightningElement, track, api } from 'lwc';
import pageUrl from '@salesforce/resourceUrl/reCAPTCHAv3';
import isReCAPTCHAValid from '@salesforce/apex/reCAPTCHAv3ServerController.isReCAPTCHAValid';

export default class GoogleCapatcha extends LightningElement {
    @api formToken;
    @api validReCAPTCHA = false;

    @track navigateTo;
    captchaWindow = null;

    constructor(){
        super();
        this.navigateTo = pageUrl;
    }

    captchaLoaded(evt){
        var e = evt;
        console.log(e.target.getAttribute('src') + ' loaded');
        if(e.target.getAttribute('src') == pageUrl){

            window.addEventListener("message", function(e) {
                if (e.data.action == "getCAPCAH" && e.data.callCAPTCHAResponse == "NOK"){
                    console.log("Token not obtained!")
                } else if (e.data.action == "getCAPCAH" ) {
                    this.formToken = e.data.callCAPTCHAResponse;
                    isReCAPTCHAValid({tokenFromClient: formToken}).then(data => {
                        this.validReCAPTCHA = data;
                    });
                }
            }, false);
        } 
    }

}