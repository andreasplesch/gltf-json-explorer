

const JSONEditor = require ('jsoneditor');
const container = document.getElementById("jsoneditor");
const options = {'mode':'form','modes':['form','tree','view','text']};
let editor = new JSONEditor(container, options);

const app= document.getElementById("app");
const inputEl = document.querySelector('#input');
const dropCtrl = new SimpleDropzone(app, inputEl);

import { GltfLoader } from 'gltf-loader-ts';

dropCtrl.on('drop', async ({files}) => {

  const constructorFromType = {
          "5120": Int8Array,
          "5121": Uint8Array,
          "5122": Int16Array,
          "5123": Uint16Array,
          "5125": Uint32Array,
          "5126": Float32Array
      }; 
  const elementsFromType =  {
          "SCALAR": 1,
          "VEC2":   2,
          "VEC3":   3,
          "VEC4":   4,
          "MAT2":   4,
          "MAT3":   9,
          "MAT4":   16
      }

  let loader = new GltfLoader();
  //let uri = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedSimple/glTF/RiggedSimple.gltf';
  try {
    let asset: Asset = await loader.loadFromFiles(files);//.catch((err) => { console.log(err); });

    let gltf: GlTf = asset.gltf;
    let accessors = gltf.accessors;
    // console.log(gltf);
    // -> {asset: {…}, scene: 0, scenes: Array(1), nodes: Array(2), meshes: Array(1), …}

    let i;
    for (i=0; i< accessors.length; i++) {
      let data = await asset.accessorData(i); // fetches BoxTextured0.bin
      //console.log(data);
      let accessor = accessors[i];
      //  console.log(accessor);
      let type = constructorFromType[accessor.componentType];
      let elements = elementsFromType[accessor.type];
      //console.log(elements * accessor.count)
      let typed = new type(data.buffer, data.byteOffset, accessor.count * elements);  
      let grouped = group( elements, typed);
      accessors[i].extras = { "structured" : grouped,
                              "flat" : flatten( grouped ) };
    }
  } catch (e) {
      alert('Try a zip or dropping multiple files.\nDetails: '+JSON.stringify(e)); }
    
  //let image: Image = await asset.imageData.get(0) // fetches CesiumLogoFlat.png
  //jsonDOM.value = gltf;
  editor.set(gltf);

  function group(elements, array) {
    let result = new Array (array.length / elements).fill(
      new Array (elements).fill(0));
    return result.map((el, i) => el.map((v, ii) => array[i*elements+ii]));
  };

  function flatten(group) {  
    return group.map(el => {
      let sep=', '
      let r = el.join(sep);
      if (el.length == 16) {
        r =  [el.slice(0, 4).join(sep),
              el.slice(4, 8).join(sep),
              el.slice(8, 12).join(sep),
              el.slice(12, 16).join(sep)];
      }
      if (el.length == 9) {
        r =  [el.slice(0, 3).join(sep),
              el.slice(3, 6).join(sep),
              el.slice(6, 9).join(sep)];
      }
      return r });
  };
};

dropCtrl.on('droperror', ({message}) => {
  alert(`Error: ${message}`);
});