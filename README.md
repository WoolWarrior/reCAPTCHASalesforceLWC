# reCAPTCHASalesforceLWC

# How to use Google reCAPTCHA v3 in Lightning Web Component

## Limitation of Salesforce platform
Salesforce platform put restriction on loading JS source into Lightning Web Component directly, i.e. the magic reCAPTCHA script cannot be directly quote into the component. 


‘You can’t load JavaScript resources from a third-party site, even a CSP Trusted Site. To use a JavaScript library from a third-party site, add it to a static resource, and then add the static resource to your component. After the library is loaded from the static resource, you can use it as normal’ - [Call APIs from JavaScript](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.js_api_calls)

There are 4 steps to integrate reCAPTCHA v3 to a Lightning Web Component
### 1.	Create html static resource with reCAPTCHA
### 2.	Create Lightning Web Component with an iframe to load the static resource
### 3.	Create the Javascript controller for the Lightning Web Component
### 4.	Create Apex class to handle the server-side verification
