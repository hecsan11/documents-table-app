import { Component, OnInit } from '@angular/core';
import { Document } from '../../core/models/app.models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, TranslateModule, ButtonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  documents: Array<Document> = [];
  completedDocuments: Array<Document> = [];
  pendingDocuments: Array<Document> = [];
  
  gateway: string = 'http://localhost:3000';
  endpointDocuments: string = '/documents';
  url: string = '';

  remainingItems: number = 0;

  documentForm!: FormGroup;

  selected: Array<Document> = [];

  constructor( private readonly httpClient: HttpClient,
    private formBuilder: FormBuilder, 
    private translate: TranslateService) {
      translate.addLangs(['es', 'en']);
      translate.setDefaultLang('es');
  }
    
  ngOnInit():void {
    this.url= this.gateway + this.endpointDocuments;
    this.getDocuments();
    this.documentForm = this.formBuilder.group({
      description: [null, Validators.required],
      status: ['Pending', Validators.required]
    })
  }

  changeLang(lang: string) {
    this.translate.use(lang);
  }

  getDocuments(): void {
    this.httpClient.get<Array<Document>>(this.url).subscribe((resp: any) => {
      this.documents = resp;
      this.checkDocuments();
    },(err: any) => {
      alert('Error retrieving data: ' + err.message);
    });
  }

  postDocument(): void {
    const body: Document = {
      description: this.documentForm.controls['description'].value,
      status: this.documentForm.controls['status'].value,
      id: Math.random()
    }
    const status = this.documentForm.controls['status'].value;
    this.httpClient.post(this.url, body).subscribe((resp: any) => {
      alert('Task added');
      this.documents.push(body);
      this.checkDocuments();
      this.documentForm.patchValue({
        description: null,
        status: 'Pending'
      });
    },(err: any) => {
      alert('Error adding task: ' + err.message)
    }
    );
  }

  putTask(): void {
    let index: number;
    let indexResp: number;
    let status: string;
    
    if (this.selected.length > 0) {
      for (var task of this.selected){
        index = this.documents.indexOf(task);
        status = task.status;
        if (status === 'Pending') {
          status = 'Completed';
        } else {
          status = 'Pending';
        }
        this.httpClient.put(this.url + '/' + this.documents[index].id, {id: this.documents[index].id, description: this.documents[index].description,
          status: status}).subscribe((resp: any) => {
          alert('Document modified');
          indexResp = this.documents.findIndex((element) => element.id === resp.id);
          this.documents[indexResp]['status'] = resp.status;
          this.checkDocuments();
        },(err: any) => {
          alert('Error modifying task: ' + err.message);
        })
      }
    } else {
      alert('Select documents to edit');
    }
    
  }

  deleteTask(): void {
    let index: number

    if (this.selected.length > 0 && this.selected.length < 2){
      for (var task of this.selected){
        index = this.documents.indexOf(task);
        // TODO: use an array of promises to resolve each promise and know the specific index when
        // resp is ok, so we can delete the task from the UI's table. If we delete more than 2 tasks
        // they will be deleted correctly in DB but the UI won´t show the correct ouput until user refreshes page
        this.httpClient.delete(this.url + '/' + this.documents[index].id).subscribe((resp: any) => {
          alert('Task deleted');
          this.documents.splice(index,1);
        },(err: any) => {
          alert('Error deleting task: ' + err.message);
        })
      }
    } else {
      this.selected.length === 0 ? alert('Select one task to delete') : alert('Select no more than 1 task to delete');
    }
  }

  evaluateTasks(tasks: Array<Document>): Array<Document> {
    this.pendingDocuments = tasks.filter( (task: any) => {
      return task.status === 'Pending'
    })
    this.completedDocuments = tasks.filter( (task: any) => {
      return task.status === 'Completed'
    })
    return this.pendingDocuments.concat(this.completedDocuments);
  }

  checkDocuments(): void {
    this.documents = this.evaluateTasks(this.documents);
    this.remainingItems = this.pendingDocuments.length;
  }

}
