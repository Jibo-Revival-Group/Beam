# Jibo Server Client for JavaScript

## Code base roots

The Jibo Server Client is fork of the official AWS SDK for JavaScript (https://github.com/aws/aws-sdk-js) available for browsers and mobile devices,
or Node.js backends.

Since official AWS SDK for JavaScript is distributed under the APACHE License version 2.0, the Jibo API Client can be distributed under
different license including closed-source.

Major goal is to reuse high quality and well tested code for request signing and retry implemented in AWS SDK for JavaScript.

Changes made to the original code are: removing AWS specific services, and changes required to run client library with services other than Jibo.
This includes either changes to client code itself and changes to tests and utility code. New services are added as required by Jibo project.

## Installing

### In the Browser

To use the SDK in the browser, simply add the following script tag to your
HTML pages:

    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1.16.min.js"></script>//TO BE CHANGED

The Jibo API Client for JavaScript is also compatible with [browserify](http://browserify.org).

### In Node.js

Add the project as a dependency to you package.json like the following:

```
"dependencies": {
  "jibo-server-client": "git+ssh://git@github.jibo.com:server/jibo-server-client.git"
}
```

### Using Bower

You can also use [Jibo Private Bower](http://bower.jibo.com) to install the SDK by typing the
following into a terminal window:

```sh
bower install jibo-server-client
```

## Usage and Getting Started

You can find a getting started guide at:

https://confluence.jibo.com/display/SER/Jibo+Server+Client+for+JavaScript

## Supported Services

<p class="note"><strong>Note</strong>:
Although all services are supported in the browser version,
not all of the services are available in the default hosted build (using the
script tag provided above). A list of services in the hosted build are provided
in the "<a href="https://git.jibo.com/projects/SER/repos/jibo-server-client/browse/doc-src/guide/browser-building.md">Working With Services</a>"
section of the browser SDK guide, including instructions on how to build a
custom version of the SDK with extra services.
</p>

The SDK currently supports the following services:

<table>
  <thead>
    <th>Service Name</th>
    <th>Class Name</th>
    <th>API Version</th>
  </thead>
  <tbody>
    <tr><td>Jibo Logs</td><td>Jibo.Logs</td><td>2015-03-01</td></tr>
  </tbody>
</table>

## License

//TO BE CHANGED
