# zendesk-connect-sar-searchapi
Zendesk SAR Application for the Search API Functioanlity used within Contact Flows

## Overview and Installation
Zendesk search for Amazon Connect is an optional add-on to the [Amazon Connect app for Zendesk](https://www.zendesk.com/apps/support/amazon-connect/?q=mkp_amazon). It enables further driving the business logic of either DTMF driven (classic IVR) or conversation driven (LEX bot) contact flows, based on search results from the Zendesk Support API.

This add-on consists of a single lambda function which is called from a Connect contact flow and is passed-in parameters which contain the type of search and search values. It's possible to search users by their detected phone number (CLI), the entered user ID, custom user fields within Zendesk, the most recent open ticket for a given user, or anything else in Zendesk Support via search templates. 

You can view the  detailed installation steps [here](https://help.voicefoundry.cloud/zendesk/zendesk-search-for-connect-with-the-help-of-the-ze#ZendeskSearchforConnectwiththehelpoftheZendeskSupportAPI-Installationguide).

We have also provided [sample contact flows](https://help.voicefoundry.cloud/zendesk/template-contact-flows) to give you a better understanding of search capabilities this lambda function provides.
