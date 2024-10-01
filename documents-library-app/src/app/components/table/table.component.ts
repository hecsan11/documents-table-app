import { Component, OnInit } from '@angular/core';
import { Document } from '../../core/models/app.models';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToolbarModule } from 'primeng/toolbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, TranslateModule, ButtonModule, ToolbarModule, InputSwitchModule,
    InputIconModule,InputTextModule,IconFieldModule, CommonModule, DropdownModule, FormsModule,
    PanelMenuModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  documents: Array<any> = [];
  completedDocuments: Array<Document> = [];
  pendingDocuments: Array<Document> = [];

  checked: boolean = false;
  
  gateway: string = 'http://localhost:3000';
  endpointDocuments: string = '/documents';
  url: string = '';

  expandedRows: any = {};

  selectedDocuments: Array<Document> = [];
  selectedLanguage: string | undefined;
  languages: Array<Object> = [];

  items: MenuItem[] = [
    {
        label: 'Bandeja de entrada',
        icon: 'pi pi-file',
        items: [
            {
                label: 'Documentos',
                icon: 'pi pi-file',
            },
        ]
    },
    {
        label: 'Contenido de ...',
        icon: 'pi pi-folder',
        items: [
            {
                label: 'Expedientes Personal',
                icon: 'pi pi-folder'
            },
            {
                label: 'Expedientes Material',
                icon: 'pi pi-cloud-download'
            }
        ]
    }]

  constructor( private readonly httpClient: HttpClient,
    private translate: TranslateService) {
      translate.addLangs(['es', 'en']);
      translate.setDefaultLang('es');
  }
    
  ngOnInit():void {
    this.url= this.gateway + this.endpointDocuments;
    this.getDocuments();
    this.languages = [{code:'es', name: this.translate.instant('languages.es')},{code:'en', name: this.translate.instant('languages.en')}]
  }

  changeLang(event: any) {
    this.translate.use(event.value.code);
  }

  changePermissions() {
    this.getDocuments();
  }

  expandAll() {
    this.expandedRows = this.documents.reduce((acc, p) => (acc[p.id] = true) && acc, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }

  getDocuments(): void {
    this.httpClient.get<Array<Document>>(this.url).subscribe((resp: any) => {
      this.documents = this.evaluateDocuments(resp);
    },(err: any) => {
      alert('Error retrieving data: ' + err.message);
    });
  }

  putDocument(document: Document, parameter: string): void {
    let index: number;
    let indexResp: number;
    let status: string;
    
    index = this.documents.indexOf(document);
    if (parameter === 'validation'){
      document.status = 'Completed';
    } else {
      document.favourite = !document.favourite;
    }
    
    this.httpClient.put(this.url + '/' + this.documents[index].id, document).subscribe((resp: any) => {
      indexResp = this.documents.findIndex((element) => element.id === resp.id);
      if (parameter === 'validation') {
        this.documents[indexResp]['status'] = resp.status;
      } else {
        this.documents[indexResp]['favourite'] = resp.favourite;
      }
     
      this.getDocuments();
    },(err: any) => {
      alert('Error modifying document: ' + err.message);
    }) 
  }

  deleteDocuments(): void {
    let index: number

    if (this.selectedDocuments.length > 0){
      for (var task of this.selectedDocuments){
        index = this.documents.indexOf(task);
        this.httpClient.delete(this.url + '/' + this.documents[index].id).subscribe((resp: any) => {
          this.documents.splice(index,1);
        },(err: any) => {
          alert('Error deleting document: ' + err.message);
        })
      }
    }
  }

  evaluateDocuments(documents: Array<Document>): Array<Document> {
    this.pendingDocuments = documents.filter( (document: any) => {
      return document.status === 'Pending'
    })
    this.completedDocuments = documents.filter( (document: any) => {
      return document.status === 'Completed'
    })
    return this.checked ? this.pendingDocuments.concat(this.completedDocuments) : this.pendingDocuments;
  }

}
