## Introduction

This technical challenge is intended to build a documents app where all the information is displayed in a table created with PrimeNg. I had the possibility to choose between Angular and React and I chose Angular 18 with standalone components. After installing Angular CLI, creating the repository and install the necessary dependencies for PrimeNG, I began to code

## First steps

An internal or external API is asked for doing this task. I could implement one app with Node.js or Nest.js where the data will be retrieved from a mock file or an external DDBB/API but at the end, I chose the fastest solution for me , and it was to create the API with JSON-Server. 

JSON-Server simulates the beahaviour of an API with the principal CRUD methods (GET, POST, PUT and DELETE). In this task , we don´t have to create new documents so POST methods are not included but they are possible if we create a "dummy form" with the Document interface.

# Usage of the app

1) Traditional way

    If we want to execute the app without Github Pages or other page that serves static files based on a bundle, just download the code from https://github.com/hecsan11/documents-table-app and install the dependencies needed. This task was done with Node 20.13.1 LTS. When we have the dependencies installed, we configurate and execute json server:

    # Configuration of json server

    Configuration is showned at "api" folder where we can find the files:

    db.json: Data is stored there where we can use REST methods (GET, PUT , POST, DELETE) for the documents
    api.server.js: Configuration of json server and REST methods

    When json server is installed, for using this server and specific data we have to go to folder ./api
    and run it in a terminal with this command:

    json-server --watch db.json

    And json-server will be initialized in localhost:3000 , hearing possible requests.

    # Start the frontend app

    Execute npm start and localhost:4200 will be initialized

2) Github Pages

    First of all, we must know that Github Pages only serves static files so we want to deploy a bundle (dist or build) to be served on the Internet. Most of the frontends projects can be deployed in Github Pages. If we want to deploy our server or backend services, we will need an app such as Heroku or Openshift which they can support server-side logic. 

    I tried to deploy the app in Github pages but I´m still having some issues. When it is properly working, if we access

    https://hecsan11.github.io/documents-table-app/

    and we initialize the json-server inside the api folder following the steps providen in # Configuration of json server, we can use the app without needing to install and start the dependencies of the package.json

# App functionalities

When both localhost:4200 (or https://hecsan11.github.io/documents-table-app/) and localhost:3000 are running, the app is working properly and we can :

- Retrieve the documents and see depending of the visualization´s permissions which are pending or completed with their respective attributes
- Change "on live" the permissions of the user.
- Change the different document´s folder and go back with the help of the left menu. This task wasn´t done, just the UI representation but no functionality is added to this menu because of lack of time.
- Collapse/expand all the rows in our table. This functionality is provided by PrimeNg´s table.
- Search by keywords provided by PrimeNg. This functionality is also important because it avoids us to create methods to filter by definition.
- Select multiple documents, count the total of them and delete selected documents.
- Show details of one expanded row
- Pagination, also provided by PrimeNG´s table
- Activate/deactivate favourite documents
- Change documents selected from one state to another, eg: 'Pending' to 'Completed' or viceversa
- More button (3 horizontal dots) is represented by UI but it hasn´t got functionality. The functionality could have been validate documents, but the validation method is done in the status column with the correspondant button. Favourite and validate document are PUT methods that modify the document state.
- Delete multiple documents
- Scroll at the table for responsive behaviour.

# Development of the architecture

When I began to develop the app, I need to create a routing app and the app config. I explained the different parts:

# App.routes.ts

```c
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  // Lazy loading of standalone components
  {
    path: 'home',
    loadComponent: () => import('./components/table/table.component').then((m) => m.TableComponent)
  }
  
];
```

Lazy loading of standalone components is implemented to load components only when they are accessed rather than from startup for easing the load. This is incredibly useful in larger, interconnected applications to reduce waiting and loading times.

A login page will it be useful to make at least, a fake login where the user identified will have a token or other object that could make him , see all the documents or just the documents with pending validations.

# App.config.ts

```c
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideHttpClient(), provideAnimations(), importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  )]
};
```

The router is configured with the routes that the application will use and we also provide hydration for the HTML nodes, HttpClient to make the API requests, provideAnimations to fix issues that can happen with some of the PrimeNg´s components such as Dropdown and others and finally import providers so we can translate the page between differents languages with the help of i18n´s folder.

# main.ts

```c
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

To initialize the app properlu

# app.component.html

```c
<div class="container">
  <router-outlet></router-outlet>
</div>
```

Angular Router module is imported into the standalone component. We separate the HTML template into another file to facilitate legibility even if it only has the router-outlet tag to execute the route redirections.

# Components, data structures and logic

# Styles and assets folders

To import all the libraries provided by PrimeNg, we have to add these lines in global styles.css

```c
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.css";
@import "primeicons/primeicons.css";
```

or in Angular JSON

```c
"styles": [
    "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
    "node_modules/primeng/resources/primeng.min.css",
    ...
]
```

Also, for using our assets folder with the i18n´s jsons for language internalization, we must add the folder in Angular.json . At the end, we will have something like this:

```c
"assets": [
    {
        "glob": "**/*",
        "input": "public"
    },
    "src/assets"
    ],
"styles": [
    "src/styles.scss"
],
```

# Development of components

After creating the app´s initialization, the different providers and the associated routing, we start creating the components in the components folder to separate the different components from the app-root. But before, we create the core folder for storing the different interfaces or data structures for Typescript:

# Core folder with models

```c
export interface Document {
    id?: number;
    name?: string;
    description?: string;
    label?: string;
    status: string;
    createdAt?: string,
    favourite?: boolean
    details?: Object,
}
```

Then, we create the table component. The table component has a lot of functionality, and the header included on this code:

# Header included in table component

```c
<p-toolbar>
    <div class="p-toolbar-group-start">
        <span class="font-bold">
            {{"header.title" | translate}}
        </span>
    </div>
    <div class="p-toolbar-group-end">
        <div class="mr-1">
            <span>{{'header.permissions' | translate}}</span>
        </div>

        <div class="mr-1">
            <p-inputSwitch [(ngModel)]="checked" (onChange)="changePermissions()" />
        </div>
        
        <div>
            <p-dropdown 
                [options]="languages" 
                optionLabel="name"
                [filter]="true"
                appendTo="body"
                [(ngModel)]="selectedLanguage"
                filterBy="name"
                (onChange)="changeLang($event)"
                [showClear]="true"
                placeholder="Select a language" />
                <ng-template pTemplate="selectedItem" let-selectedOption>
                    <div class="flex align-items-center gap-2">
                        <div>{{ selectedOption.name }}</div>
                    </div>
                </ng-template>
                <ng-template let-language pTemplate="item">
                    <div class="flex align-items-center gap-2">
                        <div>{{ language.name }}</div>
                    </div>
                </ng-template>
        </div>  
    </div>
</p-toolbar>
```

should be separated from the table component, so we can use the view´s permissions along the app for other components. Normally, we will have a token with the different toggles or permissions that a user can make along the app. 

Other things to control the actions that the user can see and do along the application could be done by outside libraries such as CASL for managing permissions on live or with the Rxjs library for Angular with an independant service to be used along the app. 

Extending the Rxjs solution, we could create an Observable to be "heard" along the app so when the user changes the view´s permission, the table component can hear this modification and change the documents available for watching.

Regarding the translation dropdown, when you select one language or another, it translates the entire pages but some of the literals haven´t got the proper label and translation associated in both i18n´s json files and the HTML files, so some of them are in spanish by default. This will be fixed soon.

# Left menu inside table component

For the left menu besides the table, we could create another independent component but I think that, in this case, there is no need for it

```c
<div class="card flex justify-content-center adjust-tabmenu">
        <p-panelMenu [model]="items" styleClass="w-full md:w-20rem" />
    </div>
```

"items" variable should have all the arrays or objects containing the different folders with the documents when we call our GET methods to obtain them. 

As I wrote before, this logic is not created yet in this app, so the p-panelMenu is only executed for UI purposes.

# PrimeNg table

The main component and library used here is the PrimeNg´s table component with has got a lot of the functionality that is provided by PrimenNg such as:

- Search by keywords
- Sort by columns
- Pagination
- Expand/collapse individual or all table´s rows
- Scroll
- Filter and search by column
- Have a selection of rows to modify, delete or other actions with the items involved
- Count all the documents involved at the table

Even that PrimeNg has got pagination, one important thing that has to be taken into account is that, normally if we have got hundreds or thousands of items, we will need a query with pages attributes so we can retrieve limited items per page for perfomance issues between the backend and the frontend.

In this approach, because of the short amount of documents that we have, PrimeNg´s basic pagination functionality was made.

# Improvements or things to take into account

The main functionalies were made but some stetical things are lacking in the app or they are different from the original mock created in Figma.

Responsive behaviour is appropiated for larger screens from 1024px to 1920 but it can have issues for smaller screens such as tablets or mobiles. At this technical challenge, this is not required, but it definitely has to be taken into account.  

Possible improvements are :

- Adecuate stetical things to the main design.
- Create better mock dates attributes for document´s dates with ISO format.
- Logic for the left document´s folders menu.
- Methods to treat dates in different formats.
- Btter treatment of API´s errors for the CRUD services used.
- Fix issues related of deploying in Github Pages.








