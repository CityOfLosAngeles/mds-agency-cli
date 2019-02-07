# mds-agency-cli
Simple command-line interface for mds-agency

Prerequisites: 

* node.js v8.0 or higher
* npm v6.0 or higher
* client-id and client-secret credentials from LADOT

Usage:

`$ ./mds-cli [vehicle|event|telemetry|wipe] [json-payload]`

Example:

> `$ ./mds-cli v '{ "device_id": "e163a95d-c2a5-4b04-833e-ff8ebfad6a02", "propulsion": ["electric"], "year": 2018, "type":"scooter", "mfgr":"Scoot" , "model":"Zipper"}'`
> 
> `POST https://sandbox.ladot.io/agency/dev/vehicles`
> 
> `{` 
>   `result: 'register device success',`
>   `device:`
>    `{ provider_id: '5f7114d1-4091-46ee-b492-e55875f7de00',`
>      `device_id: 'e163a95d-c2a5-4b04-833e-ff8ebfad6a02',`
>      `propulsion: [ 'electric' ],`
>      `year: 2018,`
>      `type: 'scooter',`
>      `mfgr: 'Scoot',`
>      `model: 'Zipper' } }`
> 



