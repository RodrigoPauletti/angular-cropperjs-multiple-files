import { Component, ViewChildren, QueryList  } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { CropperComponent } from 'angular-cropperjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {

  @ViewChildren('angularCropper') public angularCropper: QueryList<CropperComponent>;
  form: FormGroup;
  files: FormArray;
  configs: Array<any> = [];
  cropperClass = new Subject<Array<string>>();
  filesGenerated: Array<any> = [];
  generating: boolean = false;

  constructor(
    private formBuilder: FormBuilder
  ){
    this.form = this.formBuilder.group({
      files: this.formBuilder.array([])
    })
  }

  async onFileChange(event) {
    this.form.setControl('files', this.formBuilder.array([]));
    this.configs = [];
    if (event.target.files && event.target.files.length > 0) {
      for(var i = 0; i < event.target.files.length; i++){
        try {
          let contentBuffer = await this.readFileAsync(event.target.files[i]);
          await this.addFile({ 'file': contentBuffer.toString() });
          await this.configs.push({
            viewMode: 1,
            aspectRatio: NaN,
            preview: '#img-preview' + i,
            zoomOnWheel: false,
            autoCropArea: 1,
            checkOrientation: false,
          });
        } catch(err) {
          console.log(err);
        }
      }
    } else {
      console.log('Selected at least one file');
    }
  }

  readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
    })
  }

  addFile(file){
    this.files = this.form.get('files') as FormArray;
    this.files.push(this.createFile(file));
  }

  createFile(file): FormGroup {
    return this.formBuilder.group({
      data: file
    });
  }

  async changeCropperFile(index){
    this.angularCropper.toArray().forEach((cropper, i) => {
      if(index === i){
        this.cropperClass[i] = 'show';
      } else {
        this.cropperClass[i] = 'hide';
      }
    })
  }

  getCropperClassObservable(index){
    return this.cropperClass.asObservable().source[index];
  }

  async generate(){
    this.generating = true;
    this.filesGenerated = [];
    // Generate base64 from all files
    await this.angularCropper.toArray().forEach((cropper, i) => {
      this.filesGenerated.push({ file: cropper.cropper.getCroppedCanvas().toDataURL() });
    })
    this.generating = false;
  }

}

export class File {
  file: string;
}