# reCAPTCHASalesforceLWC

# How to use Google reCAPTCHA v3 in Lightning Web Component

## Limitation of Salesforce platform
Salesforce platform put restriction on loading JS source into Lightning Web Component directly, i.e. the magic reCAPTCHA script cannot be directly quote into the component. 


‘You can’t load JavaScript resources from a third-party site, even a CSP Trusted Site. To use a JavaScript library from a third-party site, add it to a static resource, and then add the static resource to your component. After the library is loaded from the static resource, you can use it as normal’ - [Call APIs from JavaScript](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.js_api_calls)

There are 4 steps to integrate reCAPTCHA v3 to a Lightning Web Component
### 1.	Create html static resource with reCAPTCHA
reCAPTCHAv3.html
```
<html>
    <head>
        <title></title>reCAPTCHA html resource</title>
        <script src="https://www.google.com/recaptcha/api.js?render=reCAPTCHA_site_key"></script>
    </head>
    <body>
        <input type="hidden" name="recaptcha_response" id="recaptchaResponse"/>
        <script type="text/javascript">
            grecaptcha.ready(function() {
                var reCAPTCHA_site_key = "reCAPTCHA_site_key";
                grecaptcha.execute('reCAPTCHA_site_key', {action: 'submit'}).then(function(token) {
                    recaptchaResponse.value = token;
                    if (token == "") {
                        parent.postMessage({ action: "getCAPCAH", callCAPTCHAResponse : "NOK"}, "*");
                    } else {
                        parent.postMessage({ action: "getCAPCAH", callCAPTCHAResponse : token}, "*");
                    }
                });
            }
        </script>
    </body>
</html>
```
reCAPTCHAv3.resource-meta.xml
```
<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>text/html</contentType>
</StaticResource>
```

### 2.	Create Lightning Web Component with an iframe to load the static resource
myLWC.html
```
<template>
    <iframe src={navigateTo} name="captchaFrame" onload={captchaLoaded}></iframe>
</template>
```

### 3.	Create the Javascript controller for the Lightning Web Component
myLWC.js
```
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
```


### 4.	Create Apex class to handle the server-side verification
reCAPTCHAv3ServerController.cls
```
public with sharing class reCAPTCHAv3ServerController {
    public reCAPTCHAv3ServerController(){

    }


    @AuraEnabled
    public static Boolean isReCAPTCHAValid(String tokenFromClient) {
        String SECRET_KEY = 'reCAPTCHA_secret_key';
        String RECAPTCHA_SERVICE_URL = 'https://www.google.com/recaptcha/api/siteverify';
        Http http = new Http();

        HttpRequest request = new HttpRequest();

        request.setEndpoint(RECAPTCHA_SERVICE_URL + '?secret=' + SECRET_KEY + '&response' + tokenFromClient);
        request.setMethod('POST');
        request.setHeader('Content-Length', '0');
        HttpResponse response = http.send(request);

        Map<String, Object> mapOfBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());

        Boolean success = (Boolean) mapOfBody.get('success');

        return success;
    }
}
```