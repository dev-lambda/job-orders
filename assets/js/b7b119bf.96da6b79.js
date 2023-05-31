"use strict";(self.webpackChunk_dev_lambda_job_orders_doc=self.webpackChunk_dev_lambda_job_orders_doc||[]).push([[995],{876:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>g});var r=n(2784);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=p(n),d=a,g=c["".concat(s,".").concat(d)]||c[d]||u[d]||o;return n?r.createElement(g,i(i({ref:t},m),{},{components:n})):r.createElement(g,i({ref:t},m))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:a,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7958:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var r=n(7896),a=(n(2784),n(876));const o={sidebar_position:3},i="API Runtime settings",l={unversionedId:"contribute/runtime",id:"contribute/runtime",title:"API Runtime settings",description:"The following configuration settings apply for the API server sub-project located at packages/api. Configuration files refer to the contents of packages/api/config folder.",source:"@site/docs/contribute/runtime.md",sourceDirName:"contribute",slug:"/contribute/runtime",permalink:"/job-orders/docs/contribute/runtime",draft:!1,editUrl:"https://github.com/dev-lambda/job-orders/edit/main/website/docs/contribute/runtime.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"Project structure",permalink:"/job-orders/docs/contribute/structure"},next:{title:"Test guidelines and tooling",permalink:"/job-orders/docs/contribute/test"}},s={},p=[{value:"Configuration files",id:"configuration-files",level:2},{value:"Environment variables",id:"environment-variables",level:2},{value:"Available environment variables",id:"available-environment-variables",level:3},{value:"Exposing environment variables",id:"exposing-environment-variables",level:3}],m={toc:p},c="wrapper";function u(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"api-runtime-settings"},"API Runtime settings"),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"The following configuration settings apply for the API server sub-project located at ",(0,a.kt)("inlineCode",{parentName:"p"},"packages/api"),". Configuration files refer to the contents of ",(0,a.kt)("inlineCode",{parentName:"p"},"packages/api/config")," folder.")),(0,a.kt)("p",null,"This projects uses the ",(0,a.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/config"},(0,a.kt)("inlineCode",{parentName:"a"},"config")," library"),". In a nutshell, configuration variables are defined in environment specific files under the ",(0,a.kt)("inlineCode",{parentName:"p"},"config")," folder and certain values can be overriden using environment variables."),(0,a.kt)("p",null,"See the official documentation on ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/node-config/node-config/wiki/Configuration-Files"},"Configuration files")," for more detals on configuration override logic and config files interpretation ordering."),(0,a.kt)("p",null,"Example usage:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="somecode.ts"',title:'"somecode.ts"'},"import config from 'config';\n\n// config get can either be used to retrieve a single value\nconst port = config.get<string>('restApi.port');\n\n// ...or a full object\nconst dbOptions = config.get<object>('mongodb.options');\n")),(0,a.kt)("h2",{id:"configuration-files"},"Configuration files"),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"In order to quiclky override settings while developping you can use ",(0,a.kt)("inlineCode",{parentName:"p"},"config/local-development.yaml"),"."),(0,a.kt)("p",{parentName:"admonition"},"Note: This file ",(0,a.kt)("strong",{parentName:"p"},"should not be versionned")," as it may be different for each developper and can possibly contain secrets for debugging purposes (it is already gitignored, but it's worth being aware of that).")),(0,a.kt)("p",null,"The following files are used:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"config/"),(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"default.yaml"),": base configuration."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"development.yaml"),": overrides config values for development."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"production.yaml"),": overrides config values for production. Don't put any sensitive data here. Prever environment variables instead."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"test.yaml"),": used when running tests."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"local-development.yaml"),": (optional) use this to override values for your local development enviromnent. This file should not be commited."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"local-test.yaml"),": (optional) use this to override values for your local test enviromnent. This file should not be commited.")))),(0,a.kt)("p",null,"These files follow the following tree structure:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="config/default.yaml"',title:'"config/default.yaml"'},"restApi:\n  # The api server port\n  port: '3000'\n  # The base url that will be used to form absolute urls\n  baseUrl: 'http://localhost'\n# The least significant level of logs that should be emitted.\nlogLevel: 'info'\n# OpenAPI base documentation infos\nopenAPI:\n  # You application title.\n  # If absent uses package.json contents (preferred).\n  title: Sample Pet Store App\n  # API version. You can use semantic versioning like 1.0.0,\n  # or an arbitrary string like 0.99-beta.\n  # If absent uses package.json contents (preferred).\n  version: 1.0.0\n  # API description. Arbitrary text in CommonMark or HTML.\n  # If absent uses package.json contents (preferred).\n  description: This is a sample server for a pet store.\n  # Link to the page that describes the terms of service.\n  # Must be in the URL format.\n  termsOfService: http://example.com/terms/\n  # Contact information: name, email, URL.\n  contact:\n    name: API Support\n    email: support@example.com\n    url: http://example.com/support\n  # Name of the license and a URL to the license description.\n  license:\n    name: ISC\n    url: https://opensource.org/license/isc-license-txt/\n  # Link to the external documentation (if any).\n  # Code or documentation generation tools can use description as the text of the link.\n  externalDocs:\n    description: Find out more\n    url: http://example.com\n# Db connection settings, see https://mongoosejs.com/docs/connections.html#options for more details.\nmongodb:\n  host: mongodb://localhost:27017/default\n  options:\n    useUnifiedTopology: 'true'\n    connectTimeoutMS: 1000\n    serverSelectionTimeoutMS: 5000\n    keepAlive: true\n")),(0,a.kt)("h2",{id:"environment-variables"},"Environment variables"),(0,a.kt)("h3",{id:"available-environment-variables"},"Available environment variables"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"varialbe"),(0,a.kt)("th",{parentName:"tr",align:null},"development defaults"),(0,a.kt)("th",{parentName:"tr",align:null},"overrides"),(0,a.kt)("th",{parentName:"tr",align:null},"description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"PORT")),(0,a.kt)("td",{parentName:"tr",align:null},"3000"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"restApi.port")),(0,a.kt)("td",{parentName:"tr",align:null},"The port that the server will listen to.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"baseUrl")),(0,a.kt)("td",{parentName:"tr",align:null},"http://localhost"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"restApi.baseUrl")),(0,a.kt)("td",{parentName:"tr",align:null},"Base url to be used when building absolute Urls`")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"logLevel")),(0,a.kt)("td",{parentName:"tr",align:null},"info"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"logLevel")),(0,a.kt)("td",{parentName:"tr",align:null},"Defines the ",(0,a.kt)("a",{parentName:"td",href:"https://github.com/winstonjs/winston#logging-levels"},"log level")," that will be emitted.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"mongoDbHost")),(0,a.kt)("td",{parentName:"tr",align:null},"mongodb://localhost:27017/dev"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"mongodb.host")),(0,a.kt)("td",{parentName:"tr",align:null},"MongoDb connection string")))),(0,a.kt)("p",null,"Examples:"),(0,a.kt)("p",null,"Increase the log verbosity for a development run"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"logLevel=debug npm run watch\n")),(0,a.kt)("p",null,"Runs the production server on the 4242 port"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"PORT=4242 npm run prod\n")),(0,a.kt)("h3",{id:"exposing-environment-variables"},"Exposing environment variables"),(0,a.kt)("p",null,"Accepted environment variables are defined in ",(0,a.kt)("inlineCode",{parentName:"p"},"config/custom-envirnment-variables.yaml"),". For every path in the configuration tree structure you can specify the environment variable that will be used as input."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="config/custom-envirnment-variables.yaml"',title:'"config/custom-envirnment-variables.yaml"'},"restApi:\n  port: 'PORT'\n  baseUrl: 'baseUrl'\nlogLevel: 'logLevel'\nmongodb:\n  host: 'mongoDbHost'\n")))}u.isMDXComponent=!0}}]);