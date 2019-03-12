# aem-component-scaffolding

**Node CLI for scaffolding AEM Components**

&lt;command&gt; is one of: init, help<br/>

The below arguments are available when creating a new component:

| **Argument** | **Required** | **Example** |
|---|---|---|
| --type | Yes | content |
| --name | Yes | my-component |
| --title | No | My Component |
| --superType | No | core/components/content/title/v1/title |
| --componentGroup | No | My Project Components |
| --category | No | my.clientlibs |
| --sync | No | true | 


**Getting Started:**
<br/><br/>
**1.**  Requires:   Node ~v7.8.0 | NPM ~4.2.0


**2.**  Add aem-component-scaffolder as dependency to your package.json file:
```
"dependencies": {
    "aem-component-scaffolding": "^1.0.0"
}
  ```

**3.**  Run Install:
```npm install --save-dev```<br/><br/>

**4.**  Link scaffold command:<br>
```
cd node_modules/aem-component-scaffolding && npm link && cd ..
```


**5.**  Generate config file:<br/>
```scaffold init```<br/><br/>


Follow the prompts  to generate config file or create your own and place it in the root of your project.<br/>
```
{
	"project": "AEM Rockstars",
	"directory": "aem-rockstars",
	"host": "localhost",
	"port": "4502",
	"username": "admin",
	"password": "admin"
}
```
<br/>


**Configuration Properties:**
Project - The human readable name of your project<br/>
Directory - The name of the project folder within the /apps directory<br/>
Host - The url to your local AEM instance<br/>
Port - The port to your local AEM instance<br/>
Username - The admin username to your local AEM instance<br/>
Password - The admin password to your local AEM instance
<br/><br/>


**Options:**
<br/>
The sync argument will watch the filesystem for changes during the component scaffolding process and import changes into CRX.<br/>
```scaffold --type content --title my-component --sync```
<br/><br/>

Copyright (c) 2017, Andrew Robinson &lt;hello@drewrobinson.com&gt;<br/>
