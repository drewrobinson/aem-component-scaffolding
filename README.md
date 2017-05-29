# aem-component-scaffolding

**Node CLI for scaffolding AEM Components**

&lt;command&gt; is one of: init, help<br/>
  required args:<br/>
   --type &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i.e. content<br/>
   --name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;i.e. my-component<br/>

  optional args:<br/>
   --title &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; i.e. My Component<br/>
   --sync<br/>
   --slingResourceSuperType<br/>
   --componentGroup<br/>
   --category<br/>

**How it Works:**
[Demo Video](https://screencast.com/t/inNoh72O9O)


**Getting Started:**
<br/><br/>
Requires:   Node v7.8.0 | NPM 4.2.0

[Install with npm:](https://www.npmjs.com/package/aem-component-scaffolding)<br/>
```npm install --save-dev```<br/><br/>
Generate aem-component-config.json<br/>
```scaffold-component init```<br/><br/>
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
Desc:<br/>
Project - The human readable name of your project<br/>
Directory - The name of the project folder within the /apps directory<br/>
Host - The url to your local AEM instance<br/>
Port - The port to your local AEM instance<br/>
Username - The admin username to your local AEM instance<br/>
Password - The admin password to your local AEM instance
<br/><br/>


**Sync:**
<br/>
The sync argument will watch the filesystem for changes during the component scaffolding process and import changes into CRX.<br/>
```scaffold-component --type content --title my-component --sync```
<br/><br/>

Copyright (c) 2017, Andrew Robinson &lt;hello@drewrobinson.com&gt;<br/>
