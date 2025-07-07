import Parse from 'parse';

// Initialize Parse
// Replace these values with your Parse Server details
// If using Back4App, you can get these values from your app settings
const PARSE_APPLICATION_ID = 'L2rUglh6tKMszfRuESDW5ORM4POHCNcMY6yzW8Cs';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = '7BGiKNXFcyQmnaZugoa7G1fxPzrfp6YU5y28DHrx';

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default Parse; 