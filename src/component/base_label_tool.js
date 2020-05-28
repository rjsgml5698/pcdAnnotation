import React, { Component } from "react";
import * as THREE from 'three';
import classesBoundingBox from "./classesBoundingBox.js";
import pcdLabelTool from "./pcd_label_tool.js";
import imageLabelTools from './image_label_tool.js';
import w2ui from 'w2ui';
import * as JSZip from 'jszip';
import * as Raphael from 'raphael';
// import imageLabelTool from "./image_label_tool";

import boundingBox from "./boundingbox.js";
import $ from 'jquery';
window.$ = $;

export default class BaseLabelTool extends Component {

  constructor(props){
    super(props);
    this.state ={
      datasets: Object.freeze({"NuScenes": "NuScenes"}),
      sequencesNuScenes: [],
      scene: new THREE.Scene(),
      currentDataset: 'NuScenes',
      currentSequence: 'One',//[2018-05-23-001-frame-00042917-00043816_small, 2018-05-23-001-frame-00042917-00043816, One]
      // temprorarily set to 100
      numFramesNuScenes: 120,//[3962,120]
      frameScreenshots: [],
      numFrames: 0,
      dataTypes: [],
      playSequence: false,
      currentFileIndex: 0,
      showCameraPosition: true,
      previousFileIndex: 0,
      fileNames: [],
      takeCanvasScreenshot: false,
      timeDelay: 1000,
      pointCloudLoaded: false,
      imageCanvasInitialized: false,
      cameraImagesLoaded: false,
      timeDelayScreenshot: 2000,
      timeDelayPlay: 100,
      imageSizes: {},
      originalAnnotations: [],   // For checking modified or not
      skipFrameCount: 1,
      targetClass: "Vehicle",
      // pageBox: document.getElementById('page_num'),
      savedFrames: [],
      cubeArray: [],
      spriteArray: [],
      bboxIndexArray: [],
      currentCameraChannelIndex: 0,
      camChannels: [{
        channel: 'CAM_FRONT_LEFT',
        positionCameraNuScenes: [1.564, 0.472, 1.535],
        fieldOfView: 70,
        rotationY: 305 * Math.PI / 180,//305 degree
        projectionMatrixNuScenes: [[110.4698206116641, 1464.0011761439307, 26.41455707029287, -916.4598489300432],
            [-337.97741211920834, 265.1972065752412, -1252.6308707181809, -729.4327569362895],
            [-0.8143136873894475, 0.5803598650034878, 0.008697449242951868, -0.7728492390141875]],
        transformationMatrixEgoToCamNuScenes: [[8.09585281e-01, -5.86688274e-01, 1.91974424e-02, 1.56400000e+00],
            [2.33267982e-02, -5.23589075e-04, -9.99727756e-01, 4.72000000e-01],
            [5.86538603e-01, 8.09812692e-01, 1.32616689e-02, 1.53500000e+00],
            [0.00000000e+00, 0.00000000e+00, 0.00000000e+00, 1.00000000e+00]],
        transformationMatrixCamToLidar: [[0.611885708104161, 0.0757328996740149, -0.787314493117665, -0.645924850428946],
            [0.790958342977185, -0.0587080682108027, 0.609070023716074, -0.511902726095409],
            [-9.94618314704501e-05, -0.995431173227924, -0.0958096818561450, -0.0976217092625083],
            [0, 0, 0, 1]],
        rotation: 305
      }, {
          channel: 'CAM_FRONT',
          positionCameraNuScenes: [1.671, -0.026, 1.536],
          fieldOfView: 70,
          rotationY: 0, // 0 degree
          projectionMatrixNuScenes: [[1260.3593003446563, 790.4433526756009, 15.627522424805397, -636.3274027306582],
              [7.834243891370816, 448.30558439994263, -1259.159501002805, -740.8962245421313],
              [-0.003064512389859362, 0.9999620062762187, 0.008160561736325754, -0.7757948007768039]],
          transformationMatrixEgoToCamNuScenes: [[-0.0047123, -0.9999733, 0.00558502, 1.671],
              [0.01358668, -0.0056486, -0.99989174, -0.026],
              [0.99989659, -0.00463591, 0.01361294, 1.536],
              [0, 0, 0, 1,]],
          transformationMatrixCamToLidar: [[0.997215031568529, -0.00936548076240627, 0.0739896518701493, -0.0340200000000000],
              [-0.0734336035104482, 0.0499789540314553, 0.996046991878090, -0.607137000000000],
              [-0.0130263843505084, -0.998706359208757, 0.0491520232212485, -0.104301000000000],
              [0, 0, 0, 1]],
          rotation: 0
      }, {
          channel: 'CAM_FRONT_RIGHT',
          positionCameraNuScenes: [1.593, -0.527, 1.526],
          fieldOfView: 70,
          rotationY: 55 * Math.PI / 180, // 55 degree
          projectionMatrixNuScenes: [[1361.856983203004, -568.9937879652269, -6.653895294513566, -312.50854189580144],
              [335.73347658567, 262.5244187804859, -1260.4228451038455, -763.337941668381],
              [0.8064805242536375, 0.5911975331694409, 0.00863948921786484, -0.8346696345144945]],
          transformationMatrixEgoToCamNuScenes: [[-8.10859430e-01, -5.85025428e-01, -1.58818285e-02, 1.59300000e+00],
              [1.90058814e-02, 7.99720013e-04, -9.99819052e-01, -5.27000000e-01],
              [5.84932270e-01, -8.11014555e-01, 1.04704634e-02, 1.52600000e+00],
              [0.00000000e+00, 0.00000000e+00, 0.00000000e+00, 1.00000000e+00]],
          transformationMatrixCamToLidar: [[0.489949531751989, -0.0484410342339139, 0.870396411247678, 0.547505822207358],
              [-0.870796041221885, -0.0739463348124615, 0.486077585826712, -0.417296775245384],
              [0.0407426180835198, -0.996130722229845, -0.0784595299758922, -0.0845163336838742],
              [0, 0, 0, 1]],
          rotation: 55
      }, {
          channel: 'CAM_BACK_RIGHT',
          positionCameraNuScenes: [1.042, -0.456, 1.595],
          fieldOfView: 70,
          rotationY: 110 * Math.PI / 180, // 110 degree
          projectionMatrixNuScenes: [[268.5366860205932, -1442.5534066704236, -5.5654251139895745, 97.19498615315976],
              [406.6870884392414, -143.59988581953755, -1258.8039286060184, -475.31377943361736],
              [0.9377138162782094, -0.34740581495648687, 0.0014136814971854525, -0.37336636003724444]],
          transformationMatrixEgoToCamNuScenes: [[-9.34966822e-01, 3.54600502e-01, -9.77368820e-03, 1.04200000e+00],
              [9.88119913e-03, -1.50763065e-03, -9.99950043e-01, -4.56000000e-01],
              [-3.54597523e-01, -9.35016690e-01, -2.09429354e-03, 1.59500000e+00],
              [0.00000000e+00, 0.00000000e+00, 0.00000000e+00, 1.00000000e+00]],
          transformationMatrixCamToLidar: [[-0.193231128863561, -0.0899745016110242, 0.977022225986264, 0.433415648129604],
              [-0.977461683106893, 0.104551287752388, -0.183698859473772, 0.902282239760038],
              [-0.0855534855862260, -0.990413220473740, -0.108171294514213, -0.157346593607020],
              [0, 0, 0, 1]],
          rotation: 110

      }, {
          channel: 'CAM_BACK',
          positionCameraNuScenes: [0.086, -0.007, 1.541],
          fieldOfView: 130,
          rotationY: Math.PI,//180 degree
          projectionMatrixNuScenes: [[-804.9366490955063, -670.8712520139895, -7.944554855775981, -532.4747992653032],
              [-2.598392799509179, -411.71700732441207, -802.0306250329542, -570.6743676244683],
              [-0.010095206737515048, -0.9999048082463075, -0.009405383928480443, -0.8092052225128153]],
          transformationMatrixEgoToCamNuScenes: [[1.78014178e-02, 9.99841527e-01, -1.74532924e-04, 8.60000000e-02],
              [1.48292972e-02, -4.38565732e-04, -9.99889944e-01, -7.00000000e-03],
              [-9.99731565e-01, 1.77968704e-02, -1.48347542e-02, 1.54100000e+00],
              [0.00000000e+00, 0.00000000e+00, 0.00000000e+00, 1.00000000e+00]],
          transformationMatrixCamToLidar: [[-0.998808553877788, -0.0149413207580060, -0.0454503498176134, -0.0867564508770912],
              [0.0439474681814231, 0.0895085938805023, -0.995004795840449, 0.949494752014195],
              [0.0188751885024967, -0.995874825746460, -0.0888185338539377, -0.104974405626315],
              [0, 0, 0, 1]],
          rotation: 180
      }, {
          channel: 'CAM_BACK_LEFT',
          positionCameraNuScenes: [1.055, 0.441, 1.605],
          fieldOfView: 70,
          rotationY: 250 * Math.PI / 180, //250 degree
          projectionMatrixNuScenes: [[-1118.65453545052, 940.0229558602045, 5.20775624882033, -642.7023004564963],
              [-404.09996798165156, -139.683623818749, -1256.6685898616693, -457.3405152874417],
              [-0.943213201117988, -0.33216765461657427, 0.003675114050138092, -0.36297000058026163]],
          transformationMatrixEgoToCamNuScenes: [[0.94571775, 0.3248984, 0.00767937, 1.055],
              [0.00612855, 0.00579634, -0.99996442, 0.441],
              [-0.32493135, 0.94573116, 0.00349055, 1.605],
              [0, 0, 0, 1]],
          transformationMatrixCamToLidar: [[-0.0663516915626888, 0.0396829723346042, -0.996997658740693, -0.799760186924911],
              [0.994993204667150, 0.0769339896518345, -0.0631911603306386, 0.765992406314240],
              [0.0742461830195015, -0.996215314549491, -0.0445785343146626, -0.0810346195489563],
              [0, 0, 0, 1]],
          rotation: 305
      }],
      currentChannelLabel: document.getElementById('cam_channel'),
      // position of the lidar sensor in ego vehicle space
      positionLidarNuscenes: [0.891067, 0.0, 1.84292],//(long, lat, vert)
      translationVectorLidarToCamFront: [0.77, -0.02, -0.3],
      showOriginalNuScenesLabels: false,
      imageAspectRatioNuScenes: 1.777777778,
      showFieldOfView: false,
      selectedMesh: undefined,
      folderEndPosition: undefined,
      folderEndSize: undefined,
      logger: undefined,
      timeElapsed: 0, // elapsed time in seconds
      timeElapsedScreenshot: 0, // elapsed time between two screenshots
      timeElapsedPlay: 0,

      // currentFileIndex : 0,
      // fileNames : [],
      // originalAnnotations : [],
      // targetClass : "Vehicle",
      // savedFrames : [],
      // cubeArray : [],

      canvasArray : [],
      canvasParamsArray : [],
      paperArray : [],
      paperArrayAll : [],
      imageArray : [],
      // pcd label tool
      folderBoundingBox3DArray : [],
      folderPositionArray : [],
      folderSizeArray : [],
      pointCloudScanList : [],
      };
  }

  componentDidMount(){
    console.log("boundingBox######################", this.props);
    this.initialize();
    
  }

  onInitialize(dataType, f){
    this.localOnInitialize[dataType] = f;
  }

  // localOnLoadAnnotation() {
  //   "CAM_FRONT_LEFT":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "CAM_FRONT":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "CAM_FRONT_RIGHT":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "CAM_BACK_RIGHT":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "CAM_BACK":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "CAM_BACK_LEFT":

  //       function (index, annotation) {
  //       }

  //   ,
  //   "PCD":

  //       function (index, annotation) {
  //       }
  // },

  // localOnSelectBBox: {
  //   "CAM_FRONT_LEFT":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "CAM_FRONT":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "CAM_FRONT_RIGHT":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "CAM_BACK_RIGHT":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "CAM_BACK":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "CAM_BACK_LEFT":

  //       function (newIndex, oldIndex) {
  //       }

  //   ,
  //   "PCD":

  //       function (newIndex, oldIndex) {
  //       }
  //   }

  // localOnInitialize: {
  //     "CAM_FRONT_LEFT":

  //         function () {
  //         }

  //     ,
  //     "CAM_FRONT":

  //         function () {
  //         }

  //     ,
  //     "CAM_FRONT_RIGHT":

  //         function () {
  //         }

  //     ,
  //     "CAM_BACK_RIGHT":

  //         function () {
  //         }

  //     ,
  //     "CAM_BACK":

  //         function () {
  //         }

  //     ,
  //     "CAM_BACK_LEFT":

  //         function () {
  //         }

  //     ,
  //     "PCD":

  //         function () {
  //         }
  // },

// Visualize 2d and 3d data
  showData(){

      if (this.state.cameraImagesLoaded === false) {
          for (let i = 0; i < this.state.numFrames; i++) {
              for (let camChannelObj in this.state.camChannels) {
                  if (this.state.camChannels.hasOwnProperty(camChannelObj)) {
                      let camChannelObject = this.state.camChannels[camChannelObj];
                      this.loadCameraImages(camChannelObject.channel, i);
                  }
              }
              this.state.imageArrayAll.push(this.state.this.state.imageArray);
          }
          this.state.cameraImagesLoaded = true;
      }
      // show 6 camera images of current frame
      for (let i = 0; i < 6; i++) {
          this.state.imageArrayAll[this.state.currentFileIndex][i].toBack();
      }


      // draw 2D bb for all objects
      // note that last element is the 'insertIndex' -> iterate until length-1
      if (this.props.contents !== undefined && this.props.contents.length > 0) {
          for (let j = 0; j < this.props.contents[this.state.currentFileIndex].length - 1; j++) {
              let annotationObj = this.props.contents[this.state.currentFileIndex][j];
              let params = this.setObjectParameters(annotationObj);
              this.draw2DProjections(params);
              // set new params
              for (let i = 0; i < annotationObj["channels"].length; i++) {
                  this.props.contents[this.state.currentFileIndex][j]["channels"][i]["lines"] = params["channels"][i]["lines"];
              }
          }
      }
      this.loadPCDData();
  }

  setTrackIds() {
      for (let annotationObj in this.props.contents[this.state.currentFileIndex]) {
          let annotation = this.props.contents[this.state.currentFileIndex][annotationObj];
          let label = annotation["class"];
          this.props.classesBoundingBox[label].nextTrackId++;
      }
  }

  loadAnnotationsNuscenes(annotations, fileIndex) {
      // Remove old bounding boxes of current frame.
      this.props.clear();
      // Add new bounding boxes.
      for (let i in annotations) {
          // convert 2D bounding box to integer values
          if (annotations.hasOwnProperty(i)) {
              ["left", "right", "top", "bottom"].forEach(function (key) {
                  annotations[i][key] = parseInt(annotations[i][key]);
              });
              let annotation = annotations[i];
              // annotationObjects.selectEmpty();
              let params = this.getDefaultObject();
              params.class = annotation.class;
              params.rotationY = parseFloat(annotation.rotationY);
              params.original.rotationY = parseFloat(annotation.rotationY);
              if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
                  this.props.addNuSceneLabel(annotation.class);
                  this.props.__target = Object.keys(this.props.content)[0];
                  params.trackId = this.props.content[annotation.class].nextTrackId;
                  this.props.content[annotation.class].nextTrackId++;
              } else {
                  params.trackId = annotation.trackId;
                  this.props[annotation.class].nextTrackId++;
              }

              // Nuscenes labels are stored in global frame in the database
              // Nuscenes: labels (3d positions) are transformed from global frame to point cloud (global -> ego, ego -> point cloud) before exporting them
              params.x = parseFloat(annotation.x);
              params.y = -parseFloat(annotation.y);
              params.z = parseFloat(annotation.z);
              params.original.x = parseFloat(annotation.x);
              params.original.y = -parseFloat(annotation.y);
              params.original.z = parseFloat(annotation.z);
              let tmpWidth = parseFloat(annotation.width);
              // swap length with height
              let tmpLength = parseFloat(annotation.height);
              let tmpHeight = parseFloat(annotation.length);
              if (tmpWidth !== 0.0 && tmpLength !== 0.0 && tmpHeight !== 0.0) {
                  tmpWidth = Math.max(tmpWidth, 0.0001);
                  tmpLength = Math.max(tmpLength, 0.0001);
                  tmpHeight = Math.max(tmpHeight, 0.0001);
                  params.width = tmpWidth;
                  params.length = tmpLength;
                  params.height = tmpHeight;
                  params.original.width = tmpWidth;
                  params.original.length = tmpLength;
                  params.original.height = tmpHeight;
              }
              params.fileIndex = fileIndex;
              // project 3D position into 2D camera image
              this.draw2DProjections(params);
              // add new entry to contents array
              this.props.set(this.props.__insertIndex, params);
              this.props.__insertIndex++;
              this.props.target().nextTrackId++;
          }
      }
  }
  // Set values to this.annotationObjects from allAnnotations
  loadAnnotationsJSON(allAnnotations) {
      // Remove old bounding boxes of current frame.
      this.props.clear();
      let maxTrackIds = [0, 0, 0, 0, 0];// vehicle, truck, motorcycle, bicycle, pedestrian
      // Add new bounding boxes.
      //for (let frameAnnotationIdx in allAnnotations) {
      for (let i = 0; i < this.state.numFrames; i++) {
          // convert 2D bounding box to integer values
          let frameAnnotations = allAnnotations[i];

          for (let annotationIdx in frameAnnotations) {
              if (frameAnnotations.hasOwnProperty(annotationIdx)) {
                  let annotation = frameAnnotations[annotationIdx];
                  let params = this.getDefaultObject();
                  params.class = annotation.class;
                  params.rotationY = parseFloat(annotation.rotationY);
                  params.original.rotationY = parseFloat(annotation.rotationY);
                  let classIdx;
                  params.trackId = annotation.trackId;
                  classIdx = this.props.BoundingBoxClassify[annotation.class].index;
                  if (params.trackId > maxTrackIds[classIdx]) {
                      maxTrackIds[classIdx] = params.trackId;
                  }
                  // Nuscenes labels are stored in global frame in the database
                  // Nuscenes: labels (3d positions) are transformed from global frame to point cloud (global -> ego, ego -> point cloud) before exporting them
                  params.x = parseFloat(annotation.x);
                  params.y = parseFloat(annotation.y);
                  params.z = parseFloat(annotation.z);
                  params.original.x = parseFloat(annotation.x);
                  params.original.y = parseFloat(annotation.y);
                  params.original.z = parseFloat(annotation.z);
                  let tmpWidth = parseFloat(annotation.width);
                  // swap length with height
                  let tmpLength = parseFloat(annotation.height);
                  let tmpHeight = parseFloat(annotation.length);
                  if (tmpWidth > 0.3 && tmpLength > 0.3 && tmpHeight > 0.3) {
                      tmpWidth = Math.max(tmpWidth, 0.0001);
                      tmpLength = Math.max(tmpLength, 0.0001);
                      tmpHeight = Math.max(tmpHeight, 0.0001);
                      params.delta_x = 0;
                      params.delta_y = 0;
                      params.delta_z = 0;
                      params.width = tmpWidth;
                      params.length = tmpLength;
                      params.height = tmpHeight;
                      params.original.width = tmpWidth;
                      params.original.length = tmpLength;
                      params.original.height = tmpHeight;
                  }
                  params.fileIndex = Number(i);
                  // add new entry to contents array
                  this.props.set(this.props.__insertIndex, params);
                  this.props.__insertIndex++;
                  if (this.state.showOriginalNuScenesLabels === true) {
                      this.props.BoundingBoxClassify.content[this.props.targetName()].nextTrackId++;
                  } else {
                    this.props.target().nextTrackId++;
                  }


              }
          }//end for loop frame annotations
          // reset track ids for next frame if nuscenes dataset and showLabels=true
          if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
              for (let i = 0; i < this.props.BoundingBoxClassify.classNameArray.length; i++) {
                this.props.BoundingBoxClassify.content[this.props.BoundingBoxClassify.classNameArray[i]].nextTrackId = 0;
              }
          }
          // reset insert index
          this.props.__insertIndex = 0;
      }// end for loop all annotations

      if (this.state.showOriginalNuScenesLabels === true) {
          let keys = Object.keys(this.props.BoundingBoxClassify.content);
          for (let i = 0; i < maxTrackIds.length; i++) {
            this.props.BoundingBoxClassify.content[keys[i]].nextTrackId = maxTrackIds[i] + 1;
          }
      } else {
          let keys = Object.keys(this.props.BoundingBoxClassify);
          for (let i = 0; i < maxTrackIds.length; i++) {
            this.props.BoundingBoxClassify[keys[i]].nextTrackId = maxTrackIds[i] + 1;
          }
      }
      // project 3D positions of current frame into 2D camera images
      if (this.props.contents[this.state.currentFileIndex].length > 0) {
          for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
              this.draw2DProjections(this.props.contents[this.state.currentFileIndex][i]);
          }
      }
  }

  // Create annotations from this.annotationObjects
  createAnnotations() {
      let allAnnotations = [];
      for (let j = 0; j < this.state.numFrames; j++) {
          let annotationsInFrame = [];
          for (let i = 0; i < this.props.contents[j].length; i++) {
              if (this.props.contents[j][i] !== undefined && this.state.cubeArray[j][i] !== undefined) {
                  let annotationObj = this.props.contents[j][i];
                  // Nuscenes labels are stored in global frame within database
                  // [optional] Nuscenes: transform 3d positions from point cloud to global frame (point cloud-> ego, ego -> global)
                  let annotation = {
                      class: annotationObj["class"],
                      // TODO: store information of 3D objects also in annotationObjects.contents instead of cubeArray
                      width: this.state.cubeArray[j][i].scale.x,
                      // swap length with height
                      length: this.state.cubeArray[j][i].scale.z,
                      height: this.state.cubeArray[j][i].scale.y,
                      x: this.state.cubeArray[j][i].position.x,
                      y: this.state.cubeArray[j][i].position.y,
                      z: this.state.cubeArray[j][i].position.z,
                      rotationY: this.state.cubeArray[j][i].rotation.z,
                      trackId: annotationObj["trackId"],
                      frameIdx: j
                  };
                  annotationsInFrame.push(annotation);
              }
          }
          allAnnotations.push(annotationsInFrame);
      }
      return allAnnotations;
  }

  initialize() {
      this.initPanes();

      this.initFrameSelector();
      $(".current").text((this.state.currentFileIndex + 1) + "/" + this.state.fileNames.length);

      let imageContainer = $("#layout_layout_panel_top .w2ui-panel-content");
      let imageWidth;
      let canvasElem;
      let imagePanelTopPos;
      const paperArray = this.state.paperArray;
      const paperArrayAll = this.state.paperArrayAll;
      const canvasArray = this.state.canvasArray;

      for (let i = 0; i < this.state.numFrames; i++) {
        paperArray = [];
          for (let channelIdx = 0; channelIdx < this.state.camChannels.length; channelIdx++) {
              if (this.state.imageCanvasInitialized === false) {
                  let channel = this.state.camChannels[channelIdx].channel;
                  let id = "image-" + channel.toLowerCase().replace(/_/g, '-');
                  let minWidth = window.innerWidth / 6;
                  let minHeight = minWidth * 1.7778;
                  imageContainer.append("<div id='" + id + "'></div>");
                  $("#" + id).css("width", minWidth);
                  $("#" + id).css("height", minHeight);
                  canvasElem = imageContainer["0"].children[channelIdx];
                  canvasArray.push(canvasElem);
                  imagePanelTopPos = parseInt($("#layout_layout_resizer_top").css("top"), 10);
                  if (this.state.currentDataset === this.state.datasets.NuScenes) {
                      imageWidth = this.state.imageSizes["NuScenes"]["minWidthNormal"];

                  }
              }
              paperArray.push(Raphael(canvasArray[channelIdx], imageWidth, imagePanelTopPos));
          }
          this.state.imageCanvasInitialized = true;
          paperArrayAll.push(paperArray);
      }
      // ---------------------------------------------------------------

      // make image container scrollable
      $("#layout_layout_panel_top .w2ui-panel-content").addClass("dragscroll");
      $("#layout_layout_panel_top .w2ui-panel-content").css("overflow", "scroll");

      let pointCloudContainer = $("#layout_layout_panel_main .w2ui-panel-content");
      pointCloudContainer.append('<div id="canvas3d" style="z-index: 0;"></div>');

      // this.pageBox.placeholder = (this.state.currentFileIndex + 1) + "/" + this.state.fileNames.length;
      this.state.camChannels.forEach(function (channelObj) {
          this.localOnInitialize[channelObj.channel]();
      }.bind(this));
      this.localOnInitialize["PCD"]();

      $(function () {
          $('#class-picker>ul>li').hover(function () {
              $(this).css('background-color', "#535353");
          }, function () {
              // on mouseout, reset the background color if not selected
              let currentClass = this.props.getCurrentClass();
              let currentClassIndex = this.props.BoundingBoxClassify[currentClass].index;
              let currentHoverIndex = $("#class-picker>ul>li").index(this);
              if (currentClassIndex !== currentHoverIndex) {
                  $(this).css('background-color', "#353535");
              }
          });
      });

      let toasts = $(".toasts")[0];
      this.logger = new Toast(toasts);

      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          for (let channelIdx in this.state.camChannels) {
              if (this.state.camChannels.hasOwnProperty(channelIdx)) {
                  let channel = this.state.camChannels[channelIdx].channel;
                  let id = "image-" + channel.toLowerCase().replace(/_/g, '-');
                  let minWidth = window.innerWidth / 6;
                  let minHeight = minWidth / 1.7778;
                  $("#" + id).css("width", minWidth);
                  $("#" + id).css("height", minHeight);
              }
          }
      }
  }

  getAnnotations() {
      let fileName;
      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          if (this.state.showOriginalNuScenesLabels === true) {
              for (let i = 0; i < this.state.fileNames.length; i++) {
                
                  fileName = this.state.fileNames[i] + ".txt";
                  request({
                      url: '/label/annotations/',
                      type: 'GET',
                      dataType: 'json',
                      data: {
                          file_name: fileName
                      },
                      success: function (res) {
                          this.loadAnnotationsNuscenes(res, i);
                      }.bind(this),
                      error: function (res) {
                      }.bind(this)
                  });
              }
          } else {
              fileName = this.state.currentDataset + "_" + this.state.currentSequence + "_annotations.txt";
              request({
                  url: '/label/annotations/',
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      file_name: fileName
                  },
                  success: function (res) {
                      this.loadAnnotationsJSON(res);
                  }.bind(this),
                  error: function (res) {
                  }.bind(this)
              });
          }
      }
  }

  reset() {
    const scene = this.state.scene;

      for (let i = scene.children.length; i >= 0; i--) {
          let obj = scene.children[i];
          scene.remove(obj);
      }

      // base label tool
      this.currentFileIndex = 0;
      this.fileNames = [];
      this.originalAnnotations = [];
      this.targetClass = "Vehicle";
      this.savedFrames = [];
      this.cubeArray = [];

      const currentCameraChannelIndex = this.state.currentCameraChannelIndex;
      currentCameraChannelIndex = 0;

      // gui쪽은 임시적으로 주석처리
      // for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
      //     let annotationObj = this.props.contents[this.state.currentFileIndex][i];
      //     guiOptions.removeFolder(annotationObj["class"] + ' ' + annotationObj["trackId"]);
      // }
      
      this.props.contents = [];
      $(".class-tooltip").remove();
      this.spriteArray = [];

      this.selectedMesh = undefined;
      this.imageCanvasInitialized = false;
      this.state.cameraImagesLoaded = false;
      this.pointCloudLoaded = false;
      $(".frame-selector__frames").empty();

      // classesBoundingBox
      this.props.BoundingBoxClassify.colorIdx = 0;
      // this.props.__target = Object.keys(classesBoundingBox)[0];
      this.props.__target = Object.keys(this.props)[0];

      // image label tool

      const canvasArray = this.state.canvasArray;
      const canvasParamsArray = this.state.canvasParamsArray;
      const paperArray = this.state.paperArray;
      const paperArrayAll = this.state.paperArrayAll;
      const imageArray = this.state.imageArray;
      const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
      const folderPositionArray = this.state.folderPositionArray;
      const folderSizeArray = this.state.folderSizeArray;
      const pointCloudScanList = this.state.pointCloudScanList;

      // canvasArray = [];
      // canvasParamsArray = [];
      // paperArray = [];
      // paperArrayAll = [];
      // imageArray = [];
      // // pcd label tool
      // folderBoundingBox3DArray = [];
      // folderPositionArray = [];
      // folderSizeArray = [];
      // pointCloudScanList = [];

      let classPickerElem = $('#class-picker ul li');
      classPickerElem.css('background-color', '#353535');
      $(classPickerElem[0]).css('background-color', '#525252');
      classPickerElem.css('border-bottom', '0px');

      classPickerElem.each(function (i, item) {
          // let propNamesArray = Object.getOwnPropertyNames(classesBoundingBox);
          let propNamesArray = Object.getOwnPropertyNames(this.props.BoundingBoxClassify);
          let color = this.props.BoundingBoxClassify[propNamesArray[i]].color;
          let attribute = "20px solid" + ' ' + color;
          $(item).css("border-left", attribute);
          $(item).css('border-bottom', '0px');
      });

      // remove image divs
      $("#layout_layout_panel_top .w2ui-panel-content").empty();

      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          w2ui['layout'].panels[0].minSize = Math.ceil(window.innerWidth) / (6 * 1.7778);
          w2ui['layout'].panels[0].maxSize = 360;
          w2ui['layout'].panels[0].size = Math.ceil(window.innerWidth) / (6 * 1.7778);
      }
      w2ui['layout'].resize();

      this.props.BoundingBoxClassify.content = [];
      $("#frame-selector__frames").empty();
  }

  start() {
      const fileNames = this.state.fileNames;

      this.initTimer();
      this.setImageSize();
      fileNames = this.getFileNames();
      this.initialize();
      this.setPanelSize(this.state.currentFileIndex);
      this.showData();
      this.getAnnotations();
  }

  getFileNames() {
      let numFiles;
      let fileNameArray = [];
      
      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          this.state.numFrames = this.state.numFramesNuScenes;
          this.setSequences();
          this.setState({
            currentSequence: this.state.sequencesNuScenes[0]
          })
          // this.state.currentSequence = this.state.sequencesNuScenes[0];
          numFiles = 120;//[3962, 120]

      } else {

      }
      for (let i = 0; i < numFiles; i++) {
          fileNameArray.push(this.pad(i, 6))
      }
      return fileNameArray;
  }

  previousFrame() {
      if (this.state.currentFileIndex >= this.skipFrameCount) {
          this.changeFrame(this.state.currentFileIndex - this.skipFrameCount);
      } else if (this.state.currentFileIndex !== 0) {
          this.changeFrame(0);
      }
  }

  nextFrame() {
      let start = new Date().getTime();
      if (this.state.currentFileIndex < (this.state.fileNames.length - 1 - this.skipFrameCount)) {
          this.changeFrame(this.state.currentFileIndex + this.skipFrameCount);
      } else if (this.state.currentFileIndex !== this.state.fileNames.length - 1) {
          this.changeFrame(this.state.fileNames.length - 1);
      }
      let end = new Date().getTime();
      let time = end - start;
      console.log(time);
  }

  jumpFrame() {
      if (0 <= Number(this.pageBox.value) - 1 && Number(this.pageBox.value) - 1 < this.state.fileNames.length) {
          this.changeFrame(Number(this.pageBox.value) - 1);
      }
  }

  removeObject(objectName) {
    const scene = this.state.scene;

      for (let i = scene.children.length - 1; i >= 0; i--) {
          let obj = scene.children[i];
          if (obj.name === objectName) {
              scene.remove(obj);
              return true;
          }
      }
      return false;
  }

  createPlane(name, angle, xpos, ypos, channel) {
      let channelIdx = getChannelIndexByName(channel);
      let geometryRightPlane = new THREE.BoxGeometry(this.state.camChannels[channelIdx].fieldOfView, 2, 0.08);
      geometryRightPlane.rotateX(Math.PI / 2);
      geometryRightPlane.rotateZ(angle);
      geometryRightPlane.translate(ypos, xpos, -0.7);//y/x/z
      let material = new THREE.MeshBasicMaterial({
          color: 0x525252,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
      });
      let planeRight = new THREE.Mesh(geometryRightPlane, material);
      planeRight.name = name;
      scene.add(planeRight);
  }

  createPrism(angle, posx, posy, width, openingLength, offsetX) {
      let posXCenter = 0 * Math.cos(angle) - offsetX * Math.sin(angle);
      let posYCenter = 0 * Math.sin(angle) + offsetX * Math.cos(angle);
      let positionCornerCenter = new THREE.Vector2(posXCenter, posYCenter);
      let posXLeft = -width * Math.cos(angle) - openingLength / 2 * Math.sin(angle);
      let posYLeft = -width * Math.sin(angle) + openingLength / 2 * Math.cos(angle);
      let positionCornerLeft = new THREE.Vector2(posXLeft, posYLeft);
      let posXRight = width * Math.cos(angle) - openingLength / 2 * Math.sin(angle);
      let posYRight = width * Math.sin(angle) + openingLength / 2 * Math.cos(angle);
      let positionCornerRight = new THREE.Vector2(posXRight, posYRight);
      let materialPrism = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.5});
      let height = 2;
      let geometryPrism = new PrismGeometry([positionCornerCenter, positionCornerLeft, positionCornerRight], height);
      geometryPrism.translate(-posy, posx, -1.7);
      let prismMesh = new THREE.Mesh(geometryPrism, materialPrism);
      prismMesh.name = "prism";
      scene.add(prismMesh);
  }

  drawFieldOfView() {
      switch (this.state.currentCameraChannelIndex) {
          case 0:
              // front left
              this.createPlane('rightplane', Math.PI / 2 - 340 * 2 * Math.PI / 360, this.state.camChannels[0].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[0].fieldOfView / 2 * Math.cos(340 * 2 * Math.PI / 360), -this.state.camChannels[0].positionCameraNuScenes[1] + this.state.camChannels[0].fieldOfView / 2 * Math.sin(340 * 2 * Math.PI / 360), "CAM_FRONT_LEFT");
              this.createPlane('leftplane', Math.PI / 2 - 270 * 2 * Math.PI / 360, this.state.camChannels[0].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[0].fieldOfView / 2 * Math.cos(270 * 2 * Math.PI / 360), -this.state.camChannels[0].positionCameraNuScenes[1] + this.state.camChannels[0].fieldOfView / 2 * Math.sin(270 * 2 * Math.PI / 360), "CAM_FRONT_LEFT");
              this.createPrism(-305 * 2 * Math.PI / 360, this.state.camChannels[0].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[0].positionCameraNuScenes[1], 0.3, 1.0, 0.073);
              break;
          case 1:
              // front
              this.createPlane('rightplane', Math.PI / 2 - 35 * 2 * Math.PI / 360, this.state.camChannels[1].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[1].fieldOfView / 2 * Math.cos(35 * 2 * Math.PI / 360), -this.state.camChannels[1].positionCameraNuScenes[1] + this.state.camChannels[1].fieldOfView / 2 * Math.sin(35 * 2 * Math.PI / 360), "CAM_FRONT");
              this.createPlane('leftplane', Math.PI / 2 - (-35) * 2 * Math.PI / 360, this.state.camChannels[1].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[1].fieldOfView / 2 * Math.cos(-35 * 2 * Math.PI / 360), -this.state.camChannels[1].positionCameraNuScenes[1] + this.state.camChannels[1].fieldOfView / 2 * Math.sin(-35 * 2 * Math.PI / 360), "CAM_FRONT");
              this.createPrism(0 * 2 * Math.PI / 360, this.state.camChannels[1].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[1].positionCameraNuScenes[1], 0.3, 1.0, 0.073);
              break;
          case 2:
              // front right
              this.createPlane('rightplane', Math.PI / 2 - 90 * 2 * Math.PI / 360, this.state.camChannels[2].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[2].fieldOfView / 2 * Math.cos(90 * 2 * Math.PI / 360), -this.state.camChannels[2].positionCameraNuScenes[1] + this.state.camChannels[2].fieldOfView / 2 * Math.sin(90 * 2 * Math.PI / 360), "CAM_FRONT_RIGHT");
              this.createPlane('leftplane', Math.PI / 2 - 20 * 2 * Math.PI / 360, this.state.camChannels[2].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[2].fieldOfView / 2 * Math.cos(20 * 2 * Math.PI / 360), -this.state.camChannels[2].positionCameraNuScenes[1] + this.state.camChannels[2].fieldOfView / 2 * Math.sin(20 * 2 * Math.PI / 360), "CAM_FRONT_RIGHT");
              this.createPrism(-55 * 2 * Math.PI / 360, this.state.camChannels[2].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[2].positionCameraNuScenes[1], 0.3, 1.0, 0.073);
              break;
          case 3:
              // back right
              this.createPlane('rightplane', Math.PI / 2 - 145 * 2 * Math.PI / 360, this.state.camChannels[3].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[3].fieldOfView / 2 * Math.cos(145 * 2 * Math.PI / 360), -this.state.camChannels[3].positionCameraNuScenes[1] + this.state.camChannels[3].fieldOfView / 2 * Math.sin(145 * 2 * Math.PI / 360), "CAM_BACK_RIGHT");
              this.createPlane('leftplane', Math.PI / 2 - 75 * 2 * Math.PI / 360, this.state.camChannels[3].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[3].fieldOfView / 2 * Math.cos(75 * 2 * Math.PI / 360), -this.state.camChannels[3].positionCameraNuScenes[1] + this.state.camChannels[3].fieldOfView / 2 * Math.sin(75 * 2 * Math.PI / 360), "CAM_BACK_RIGHT");
              this.createPrism(-110 * 2 * Math.PI / 360, this.state.camChannels[3].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[3].positionCameraNuScenes[1], 0.3, 1.0, 0.073);
              break;
          case 4:
              // back
              this.createPlane('rightplane', Math.PI / 2 - 245 * 2 * Math.PI / 360, this.state.camChannels[4].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[4].fieldOfView / 2 * Math.cos(245 * 2 * Math.PI / 360), -this.state.camChannels[4].positionCameraNuScenes[1] + this.state.camChannels[4].fieldOfView / 2 * Math.sin(245 * 2 * Math.PI / 360), "CAM_BACK");
              this.createPlane('leftplane', Math.PI / 2 - 115 * 2 * Math.PI / 360, this.state.camChannels[4].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[4].fieldOfView / 2 * Math.cos(115 * 2 * Math.PI / 360), -this.state.camChannels[4].positionCameraNuScenes[1] + this.state.camChannels[4].fieldOfView / 2 * Math.sin(115 * 2 * Math.PI / 360), "CAM_BACK");
              this.createPrism(-180 * 2 * Math.PI / 360, this.state.camChannels[4].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[4].positionCameraNuScenes[1], 0.97, 1.0, 0.046);
              break;
          case 5:
              // back left
              this.createPlane('rightplane', Math.PI / 2 - 285 * 2 * Math.PI / 360, this.state.camChannels[5].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[5].fieldOfView / 2 * Math.cos(285 * 2 * Math.PI / 360), -this.state.camChannels[5].positionCameraNuScenes[1] + this.state.camChannels[5].fieldOfView / 2 * Math.sin(285 * 2 * Math.PI / 360), "CAM_BACK_LEFT");
              this.createPlane('leftplane', Math.PI / 2 - 215 * 2 * Math.PI / 360, this.state.camChannels[5].positionCameraNuScenes[0] - this.positionLidarNuscenes[0] + this.state.camChannels[5].fieldOfView / 2 * Math.cos(215 * 2 * Math.PI / 360), -this.state.camChannels[5].positionCameraNuScenes[1] + this.state.camChannels[5].fieldOfView / 2 * Math.sin(215 * 2 * Math.PI / 360), "CAM_BACK_LEFT");
              this.createPrism(-250 * 2 * Math.PI / 360, this.state.camChannels[5].positionCameraNuScenes[0] - this.positionLidarNuscenes[0], this.state.camChannels[5].positionCameraNuScenes[1], 0.3, 1.0, 0.073);
              break;
      }
  }
  // changeCamChannel: function (currentChannelNumber, nextChannelNumber) {
  //     // if (this.dataTypes.indexOf("PCD") >= 0) {
  //     //     // remove all folder of current channel
  //     //     for (var k = 0; k < annotationObjects.contents.length; k++) {
  //     //         guiOptions.removeFolder(annotationObjects.contents[k]["class"] + ' ' + annotationObjects.contents[k]["trackId"]);
  //     //     }
  //     // }
  //     if (this.hasLoadedPCD) {
  //         cFlag = false;
  //         rFlag = false;
  //         this.bboxes = [];
  //         // do not delete bounding boxes that were set previously
  //         // this.state.cubeArray[this.state.currentFileIndex][this.currentCameraChannelIndex] = [];
  //         numbertagList = [];
  //         folderBoundingBox3DArray = [];
  //         guiTag = [];
  //         numbertagList = [];
  //         folderPositionArray = [];
  //         folderSizeArray = [];
  //         this.bboxIndexArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex] = [];
  //     }
  //     var previousChannelNumber = currentChannelNumber - 1;
  //     if (previousChannelNumber < 0) {
  //         previousChannelNumber = 5;
  //     }
  //     this.hasLoadedImage[labelTool.camChannels.indexOf(previousChannelNumber)] = false;
  //     this.hasLoadedImage[labelTool.camChannels.indexOf(currentChannelNumber)] = false;
  //     this.hasLoadedImage[labelTool.camChannels.indexOf(nextChannelNumber)] = false;
  //     this.hasLoadedPCD = false;
  //     this.showData();
  //
  //     // render labels
  //     // hold flag not set
  //     if (this.savedFrames[this.state.currentFileIndex][this.currentCameraChannelIndex] == true) {
  //
  //     } else {
  //         // load annotations from file for all three camera views if they exist, otherwise show blank image
  //         if (annotationFileExist(this.state.currentFileIndex)) {
  //             this.getAnnotations(this.state.currentFileIndex);
  //         } else {
  //             // no annotations are loaded
  //             annotationObjects.clear();
  //         }
  //     }
  //
  //     // change FOV of camera
  //     this.removeObject('rightplane');
  //     this.removeObject('leftplane');
  //     this.removeObject('prism');
  //     this.drawFieldOfView();
  //
  //
  // }
  // ,
  changeFrame(newFileIndex) {

    const scene = this.state.scene;
    const logger = this.state.logger;

      if (newFileIndex === this.state.numFrames - 1 && this.state.playSequence === true) {
          // last frame will be shown
          // stop playing sequence
          this.state.playSequence = false;
      }

      const interpolationObjIndexCurrentFile = this.props.getSelectionIndex();
      if (interpolationObjIndexCurrentFile === -1 && this.props.interpolationMode === true) {
          logger.error("Please select an object for interpolation or uncheck interpolation mode.");
          return;
      }

      this.removeObject("pointcloud-scan-" + this.state.currentFileIndex);
      this.removeObject("pointcloud-scan-no-ground-" + this.state.currentFileIndex);

      // bring current image into background instead of removing it
      this.setPanelSize(newFileIndex);

      // remove all 3D BB objects from scene
      for (let i = scene.children.length; i >= 0; i--) {
          let obj = scene.children[i];
          scene.remove(obj);
      }
      // remove all 2D BB objects from camera images
      this.remove2DBoundingBoxes();
      // remove all class labels in point cloud or bird eye view
      $(".class-tooltip").remove();

      // store copy flags before removing folder
      let copyFlags = [];
      // remove all folders
      for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
          let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
          if (checkboxElem !== null) {
              copyFlags.push(checkboxElem.firstChild.checked);
          }
          guiOptions.removeFolder(this.props.contents[this.state.currentFileIndex][i]["class"] + ' ' + annotationObjects.contents[this.state.currentFileIndex][i]["trackId"]);
      }
      // empty all folder arrays
      folderBoundingBox3DArray = [];
      folderPositionArray = [];
      folderSizeArray = [];

      if (this.state.cubeArray[newFileIndex].length === 0) {
          // move 3D objects to new frame if nextFrame has no labels and copy flag is set
          for (let i = 0; i < this.state.cubeArray[this.state.currentFileIndex].length; i++) {
              let copyLabelToNextFrame = copyFlags[i];
              if (copyLabelToNextFrame === true) {
                  let mesh = this.state.cubeArray[this.state.currentFileIndex][i];
                  let clonedMesh = mesh.clone();
                  this.state.cubeArray[newFileIndex].push(clonedMesh);
                  scene.add(clonedMesh);

                  let sprite = this.spriteArray[this.state.currentFileIndex][i];
                  let clonedSprite = sprite.clone();
                  this.spriteArray[newFileIndex].push(clonedSprite);
                  scene.add(clonedSprite);
              }
          }
          // Deep copy
          for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
              //let copyLabelToNextFrame = annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"];
              let copyLabelToNextFrame = copyFlags[i];
              if (copyLabelToNextFrame === true) {
                  if (this.props.interpolationMode === true) {
                      // set start index
                      this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEndFileIndex"] = newFileIndex;
                  }
                  this.props.contents[newFileIndex].push($.extend(true, {}, this.props.contents[this.state.currentFileIndex][i]));
              }
          }
      } else {
          // next frame has already 3D annotations which will be added to the scene
          for (let i = 0; i < this.state.cubeArray[newFileIndex].length; i++) {
              let mesh = this.state.cubeArray[newFileIndex][i];
              scene.add(mesh);
              let sprite = this.spriteArray[newFileIndex][i];
              scene.add(sprite);

              let trackId = annotationObjects.contents[newFileIndex][i]["trackId"];
              let className = annotationObjects.contents[newFileIndex][i]["class"];
              // let objectIndexByTrackIdAndClass = getObjectIndexByTrackIdAndClass(trackId, className, this.state.currentFileIndex);
              // if (objectIndexByTrackIdAndClass !== -1) {
              // next frame contains a new object -> add tooltip for new object
              let classTooltipElement = $("<div class='class-tooltip' id='tooltip-" + className.charAt(0) + trackId + "'>" + trackId + "</div>");
              // set background color
              let color = classesBoundingBox[className].color;
              let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
              const vector = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z + mesh.scale.z / 2);
              const canvas = renderer.domElement;
              // currentCamera from pcd js
              vector.project(currentCamera);
              vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width));
              vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height));
              $(classTooltipElement[0]).css("top", `${vector.y + this.props.headerHeight + imagePaneHeight - 21}px`);
              $(classTooltipElement[0]).css("left", `${vector.x}px`);
              $(classTooltipElement[0]).css("opacity", 1.0);

              $("body").append(classTooltipElement);
              // }
          }
          for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
              let trackId = this.props.contents[this.state.currentFileIndex][i]["trackId"];
              let className = this.props.contents[this.state.currentFileIndex][i]["class"];
              let objectIndexByTrackIdAndClass = this.props.getObjectIndexByTrackIdAndClass(trackId, className, newFileIndex);
              let copyLabelToNextFrame = copyFlags[i];
              if (objectIndexByTrackIdAndClass === -1 && copyLabelToNextFrame === true) {
                  // clone that object to new frame if copy flag set and it not yet exist in next frame
                  let mesh = this.state.cubeArray[this.state.currentFileIndex][i];
                  let clonedMesh = mesh.clone();
                  this.state.cubeArray[newFileIndex].push(clonedMesh);
                  scene.add(clonedMesh);
                  let sprite = this.spriteArray[this.state.currentFileIndex][i];
                  let clonedSprite = sprite.clone();
                  this.spriteArray[newFileIndex].push(clonedSprite);
                  scene.add(clonedSprite);
                  this.props.contents[newFileIndex].push($.extend(true, {}, this.props.contents[this.state.currentFileIndex][i]));
              }
          }
      }

      // this.pageBox.placeholder = (newFileIndex + 1) + "/" + this.state.fileNames.length;
      $(".current").text((newFileIndex + 1) + "/" + this.state.fileNames.length);
      // this.pageBox.value = "";
      // set class selected to current frame bar
      // unselect all
      $("div.frame").attr("class", "frame default");
      let currentBar = $("div.frame")[newFileIndex];
      currentBar.className = "frame default selected";


      let bboxEndParams = undefined;
      if (this.props.interpolationMode === true) {
          bboxEndParams = {
              x: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["x"],
              y: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["y"],
              z: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["z"],
              rotationY: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["rotationY"],
              width: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["width"],
              length: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["length"],
              height: this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["height"],
              newFileIndex: newFileIndex
          };
      }

      let selectionIndexNextFile = -1;
      if (interpolationObjIndexCurrentFile !== -1) {
          if (this.props.interpolationMode === true) {
              selectionIndexNextFile = this.props.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], newFileIndex);
          } else {
              if (this.props.getSelectionIndex() !== -1 && this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()] !== undefined) {
                  selectionIndexNextFile = this.props.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()]["trackId"], this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()]["class"], newFileIndex);
              }

          }
      }
      // update folders with values of next/previous frame
      for (let i = 0; i < this.props.contents[newFileIndex].length; i++) {
          let annotationObj = this.props.contents[newFileIndex][i];
          let copyFlag;
          // if next object exists in current frame then use copy flag of current frame
          let indexInCurrentFile = this.props.getObjectIndexByTrackIdAndClass(annotationObj["trackId"], annotationObj["class"], this.state.currentFileIndex);
          if (indexInCurrentFile === -1) {
              //object does not exist in current frame -> use copy index of next frame
              copyFlag = annotationObj["copyLabelToNextFrame"];
          } else {
              copyFlag = copyFlags[indexInCurrentFile];
          }
          let bbox = {
              class: annotationObj["class"],
              x: annotationObj["x"],
              y: annotationObj["y"],
              z: annotationObj["z"],
              width: annotationObj["width"],
              length: annotationObj["length"],
              height: annotationObj["height"],
              rotationY: parseFloat(annotationObj["rotationY"]),
              trackId: annotationObj["trackId"],
              copyLabelToNextFrame: copyFlag
          };
          // add bboxEnd for selected object
          if (selectionIndexNextFile === i && this.props.interpolationMode === true) {
              this.props.addBoundingBoxGui(bbox, bboxEndParams);
          } else {
            this.props.addBoundingBoxGui(bbox, undefined);
          }
      }
      if (this.props.interpolationMode === true) {
          // clone current object position and scale and set it to end position and end scale
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["x"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["x"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["y"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["y"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["z"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["z"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["rotationY"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["rotationY"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["width"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["width"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["length"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["length"];
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["height"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["height"];

          let objectIndexNextFrame = this.props.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], newFileIndex);
          this.props.__selectionIndexNextFrame = objectIndexNextFrame;
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["position"]["x"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["x"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["position"]["y"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["y"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["position"]["z"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["z"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["position"]["rotationY"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["rotationY"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["size"]["width"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["width"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["size"]["length"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["length"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationEnd"]["size"]["height"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["height"];

          // add start frame number
          let interpolationStartFileIndex = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"];
          this.props.contents[newFileIndex][objectIndexNextFrame]["interpolationStartFileIndex"] = interpolationStartFileIndex;
          folderPositionArray[objectIndexNextFrame].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + (interpolationStartFileIndex + 1) + ")";
          folderSizeArray[objectIndexNextFrame].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + (interpolationStartFileIndex + 1) + ")";

          // add end frame number
          if (interpolationStartFileIndex !== newFileIndex) {
              if (this.folderEndPosition !== undefined && this.folderEndSize !== undefined) {
                  this.folderEndPosition.domElement.firstChild.firstChild.innerText = "Interpolation End Position (frame " + (newFileIndex + 1) + ")";
                  this.folderEndSize.domElement.firstChild.firstChild.innerText = "Interpolation End Size (frame " + (newFileIndex + 1) + ")";
              }
              // enable button if selected mesh not undefined
              if (this.selectedMesh !== undefined) {
                  this.props.interpolateBtn.domElement.parentElement.parentElement.style.pointerEvents = "all";
                  this.props.interpolateBtn.domElement.parentElement.parentElement.style.opacity = 1.0;
              }
          }

      } else {
          if (this.props.getSelectionIndex() !== -1 && this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()] !== undefined) {
              let objectIndexNextFrame = this.props.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()]["trackId"], this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()]["class"], newFileIndex);
              this.props.__selectionIndexNextFrame = objectIndexNextFrame;
          }
      }

      this.previousFileIndex = this.state.currentFileIndex;
      // open folder of selected object
      if (selectionIndexNextFile !== -1) {
          // NOTE: set current file index after querying index above
          this.state.currentFileIndex = newFileIndex;
          interpolationObjIndexCurrentFile = interpolationObjIndexNextFile;
          this.props.__selectionIndexCurrentFrame = this.props.__selectionIndexNextFrame;
          this.selectedMesh = this.state.cubeArray[newFileIndex][selectionIndexNextFile];
          if (this.selectedMesh !== undefined) {
              addTransformControls();
          } else {
            this.removeObject("transformControls");
          }
          let channels = this.props.contents[newFileIndex][selectionIndexNextFile]["channels"];
          for (let channelIdx in channels) {
              if (channels.hasOwnProperty(channelIdx)) {
                this.props.select(selectionIndexNextFile, channels[channelIdx].channel);
              }
          }
      }
      this.state.currentFileIndex = newFileIndex;
      interpolationObjIndexCurrentFile = interpolationObjIndexNextFile;
      this.props.__selectionIndexCurrentFrame = this.props.__selectionIndexNextFrame;
      this.showData();

      // adjust panel height

  }

  addResizeEventForImage() {
      $(window).unbind("resize");
      $(window).resize(function () {
          // keepAspectRatio();
      });
  }

  addResizeEventForPCD() {
      $(window).unbind("resize");
      $(window).resize(function () {
          $(function () {
              if ($("#image-cam-front-left").css("display") === "block") {
                  let windowWidth = $('#label-tool-wrapper').width();
                  let width = windowWidth / 4 > 100 ? windowWidth / 4 : 100;
                  let height = width * 5 / 8;
                  // changeCanvasSize(width, height);
              }
          });
      });
  }

  resetBoxes() {
      for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
          let obj = this.props.contents[this.state.currentFileIndex][i];
          let cubeObj = this.state.cubeArray[this.state.currentFileIndex][i];
          if (obj["original"] !== undefined) {
              if (obj["original"]["class"] !== undefined) {
                  if (obj["class"] !== obj["original"]["class"]) {
                      obj["class"] = obj["original"]["class"];
                      // TODO: update color in 6 cam images and in BEV

                      if (this.state.selectedMesh !== undefined) {
                          // TODO: update class in classpicker if selected object not undefined
                      }
                  }
              }
              if (obj["original"]["x"] !== undefined) {
                  obj["x"] = obj["original"]["x"];
                  cubeObj["position"]["x"] = obj["original"]["x"];
              }
              if (obj["original"]["y"] !== undefined) {
                  obj["y"] = obj["original"]["y"];
                  cubeObj["position"]["y"] = obj["original"]["y"];
              }
              if (obj["original"]["z"] !== undefined) {
                  obj["z"] = obj["original"]["z"];
                  cubeObj["position"]["z"] = obj["original"]["z"];
              }
              if (obj["original"]["width"] !== undefined) {
                  obj["width"] = obj["original"]["width"];
                  cubeObj["scale"]["x"] = obj["original"]["width"];
              }
              if (obj["original"]["length"] !== undefined) {
                  obj["length"] = obj["original"]["length"];
                  cubeObj["scale"]["y"] = obj["original"]["length"];
              }
              if (obj["original"]["height"] !== undefined) {
                  obj["height"] = obj["original"]["height"];
                  cubeObj["scale"]["z"] = obj["original"]["height"];
              }
              if (obj["original"]["rotationY"] !== undefined) {
                  obj["rotationY"] = obj["original"]["rotationY"];
                  cubeObj["rotation"]["z"] = obj["original"]["rotationY"];
              }
          }
      }
  }

// selectYes() {
//     $(function () {
//         $("#label-tool-dialogue-overlay").remove();
//     });
//     if (updateFlag)
//         return;
//     updateFlag = true;
//     document.getElementById("overlay-text").innerHTML = "Updating Database...";
//     $(function () {
//         $("#label-tool-status-overlay").fadeIn();
//     });
//     this.setAnnotations();
//     $.ajax({
//         url: '/labeling_tool/update_database/',
//         type: 'POST',
//         dataType: 'json',
//         data: {
//             images: this.state.fileNames.length,
//             label_id: this.labelId
//         },
//         complete: function (res) {
//             location.href = "label_select";
//         }.bind(this)
//     })
// },
//
// selectNo() {
//     $(function () {
//         $("#label-tool-dialogue-overlay").fadeOut();
//     });
// },


  handlePressKey(code, value) {
      if (code === 13) {
          this.jumpFrame();
      }
  }


  setImageSize() {
      const imageSizes = this.state.imageSizes
      // calculate the image width given the window width
      imageSizes = {
          "NuScenes": {
              minWidthNormal: Math.floor(window.innerWidth / 6),
              minHeightNormal: Math.floor(window.innerWidth / (6 * 1.77778)),
              maxWidthNormal: 640,
              maxHeightNormal: 360
          }
      };
  }

  setObjectParameters(annotationObj) {
      let params = {
          class: annotationObj["class"],
          x: annotationObj["x"],
          y: annotationObj["y"],
          z: annotationObj["z"],
          width: annotationObj["width"],
          length: annotationObj["length"],
          height: annotationObj["height"],
          rotationY: parseFloat(annotationObj["rotationY"]),
          channels: [{
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: ""
          }]
      };
      for (let i = 0; i < annotationObj["channels"].length; i++) {
          let channelObj = annotationObj["channels"][i];
          if (channelObj.channel !== undefined) {
              params["channels"][i]["channel"] = channelObj.channel;
          }
      }
      return params;
  }

  getIndexByDimension(width, length, height) {
      for (let obj in this.props.contents[this.state.currentFileIndex]) {
          let annotation = this.props.contents[this.state.currentFileIndex][obj];
          if (annotation.width === width && annotation.length === length && annotation.height === height) {
              return this.props.contents[this.state.currentFileIndex].indexOf(annotation);
          }
      }
      return -1;
  }

  draw2DProjections(params) {
      for (let i = 0; i < params.channels.length; i++) {
          if (params.channels[i].channel !== undefined && params.channels[i].channel !== "") {
              params.channels[i].projectedPoints = calculateProjectedBoundingBox(params.x, params.y, params.z, params.width, params.length, params.height, params.channels[i].channel, params.rotationY);
              // calculate line segments
              let channelObj = params.channels[i];
              if (params.channels[i].projectedPoints !== undefined && params.channels[i].projectedPoints.length === 8) {
                  let horizontal = params.width > params.length;
                  params.channels[i].lines = calculateAndDrawLineSegments(channelObj, params.class, horizontal, false);
              }
          }
      }
  }

  numberToText(n) {
      if (n === 0) {
          return "";
      } else if (n <= 19) {
          let textNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
          return textNumbers[n - 1];
      } else if (n <= 99) {
          let textNumbers = ["Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
          let firstPart = textNumbers[Math.floor(n / 10) - 2];
          let secondPart = this.numberToText(n % 10);
          if (secondPart === "") {
              return firstPart;
          } else {
              return firstPart + "_" + secondPart;
          }
      } else if (n === 100) {
          return "Hundred";
      }
  }

  setSequences() {
      for (let i = 1; i <= 100; i++) {
          let numberAsText = this.numberToText(i).toUpperCase();
          this.state.sequencesNuScenes.push(numberAsText);
      }
  }

  getDefaultObject() {
      let params = {
          class: "",
          x: -1,
          y: -1,
          z: -1,
          delta_x: 0,
          delta_y: 0,
          delta_z: 0,
          width: -1,
          length: -1,
          height: -1,
          rotationY: -1,
          original: {
              x: -1,
              y: -1,
              z: -1,
              width: -1,
              length: -1,
              height: -1,
              rotationY: -1
          },
          interpolationStartFileIndex: -1,
          interpolationStart: {
              position: {
                  x: -1,
                  y: -1,
                  z: -1,
                  rotationY: -1
              },
              size: {
                  width: -1,
                  length: -1,
                  height: -1
              }
          },
          interpolationEnd: {
              position: {
                  x: -1,
                  y: -1,
                  z: -1,
                  rotationY: -1
              },
              size: {
                  width: -1,
                  length: -1,
                  height: -1
              }
          },
          trackId: -1,
          channels: [{
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_FRONT_LEFT'
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_FRONT'
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_FRONT_RIGHT'
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_BACK_RIGHT'
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_BACK'
          }, {
              rect: [],
              projectedPoints: [],
              lines: [],
              channel: 'CAM_BACK_LEFT'
          }],
          fromFile: true,
          fileIndex: -1,
          copyLabelToNextFrame: false
      };
      return params;
  }

  remove2DBoundingBoxes = () => {
      for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
          for (let j = 0; j < this.props.contents[this.state.currentFileIndex][i].channels.length; j++) {
              for (let k = 0; k < this.props.contents[this.state.currentFileIndex][i].channels[j].lines.length; k++) {
                  let line = this.props.contents[this.state.currentFileIndex][i].channels[j].lines[k];
                  if (line !== undefined) {
                      console.log("remove");
                      line.remove();
                  }
              }
          }
      }
  }

  initPanes() {
      let maxHeight;
      let minHeight;
      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          minHeight = this.state.imageSizes["NuScenes"]["minHeightNormal"];
          maxHeight = this.state.imageSizes["NuScenes"]["maxHeightNormal"];
      }

      let topStyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 0px;';
      $('#label-tool-wrapper').w2layout({
          name: 'layout',
          panels: [
              {type: 'top', size: minHeight, resizable: true, style: topStyle, minSize: minHeight, maxSize: maxHeight}
          ],
          onResizing(event) {
              let topElem = $("#layout_layout_panel_top")[0];
              let newImagePanelHeight = topElem.offsetHeight;
              let newWidth;
              let newWidthBackFront;
              if (this.state.currentDataset === this.state.datasets.NuScenes) {
                  newWidth = newImagePanelHeight * this.state.imageAspectRatioNuScenes;
              }
              if (newImagePanelHeight === 0 || newWidth === 0) {
                  return;
              }
              for (let channelIdx in this.state.camChannels) {
                  if (this.state.camChannels.hasOwnProperty(channelIdx)) {
                      let channelObj = this.state.camChannels[channelIdx];
                      let channel = channelObj.channel;
                      if (this.state.currentDataset === this.state.datasets.NuScenes) {
                          changeCanvasSize(newWidth, newImagePanelHeight, channel);
                      }
                  }
              }
              w2ui['layout'].set('top', {size: newImagePanelHeight});
              // adjust height of helper views
              let newCanvasHeight = (window.innerHeight - this.props.headerHeight - newImagePanelHeight) / 3;
              console.log(this.props.headerHeight + newImagePanelHeight);
              $("#canvasSideView").css("height", newCanvasHeight);
              $("#canvasSideView").css("top", this.props.headerHeight + newImagePanelHeight);
              this.props.initViews.views[1].height = newCanvasHeight;
              this.props.initViews.views[1].top = 0;
              $("#canvasFrontView").css("height", newCanvasHeight);
              $("#canvasFrontView").css("top", this.props.headerHeight + newImagePanelHeight + newCanvasHeight);
              this.props.initViews.views[2].height = newCanvasHeight;
              this.props.initViews.views[2].top = newCanvasHeight;
              $("#canvasBev").css("height", newCanvasHeight);
              $("#canvasBev").css("top", this.props.headerHeight + newImagePanelHeight + 2 * newCanvasHeight);
              this.props.initViews.views[3].height = newCanvasHeight;
              this.props.initViews.views[3].top = 2 * newCanvasHeight;
              // update camera of helper views
              for (let i = 1; i < this.props.initViews.views.length; i++) {
                  let view = this.props.initViews.views[i];
                  view.height = newCanvasHeight;
                  let top = 4;
                  let bottom = -4;
                  let aspectRatio = view.width / view.height;
                  let left = bottom * aspectRatio;
                  let right = top * aspectRatio;
                  let camera = view.camera;
                  camera.left = left;
                  camera.right = right;
                  camera.top = top;
                  camera.bottom = bottom;
                  camera.updateProjectionMatrix();
              }
              // update projection of bounding boxes on camera images
              // delete all labels
              this.remove2DBoundingBoxes();
              // draw all labels
              for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
                  let annotationObj = this.props.contents[this.state.currentFileIndex][i];
                  let params = this.setObjectParameters(annotationObj);
                  this.draw2DProjections(params);
              }
              // update position of controls
              $("#bounding-box-3d-menu").css("top", this.props.headerHeight + newImagePanelHeight);
          },
          onRefresh(event) {
              console.log('object ' + event.target + ' is refreshed');
              event.onComplete = function () {
                  $("#layout_layout_resizer_top").on('click', function () {
                      w2ui['layout'].resize();
                  });
                  $("#layout_layout_resizer_top").on('drag', function () {
                      w2ui['layout'].resize();
                  });
              }
          }
      });
      w2ui['layout'].resizer = 10;
      w2ui['layout'].resize();
      w2ui['layout'].refresh();
  }

  // $("#previous-frame-button").keyup(function (e) {
  //     if (e.which === 32) {
  //         return false;
  //     }
  // });

  // $("#next-frame-button").keyup(function (e) {
  //     if (e.which === 32) {
  //         return false;
  //     }
  // });

  calculateAndDrawLineSegments(channelObj, className, horizontal, selected) {
      let channel = channelObj.channel;
      let lineArray = [];
      let channelIdx = getChannelIndexByName(channel);
      // temporary color bottom 4 lines in yellow to check if projection matrix is correct
      // let color = '#ffff00';
      // uncomment line to use yellow to color bottom 4 lines
      let color;
      if (selected === true) {
          color = "#ff0000";
      } else {
          if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
              let classIdx = classesBoundingBox.classNameArray.indexOf(className);
              color = classesBoundingBox.colorArray[classIdx];
          } else {
              color = classesBoundingBox[className].color;
          }
      }

      // color objects that are selected in red


      let imageHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
      let imageWidth;
      if (this.state.currentDataset === this.state.datasets.NuScenes) {
          imageWidth = imageHeight * this.state.imageAspectRatioNuScenes;
      }

      // bottom four lines
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[0], channelObj.projectedPoints[1], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[1], channelObj.projectedPoints[2], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[2], channelObj.projectedPoints[3], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[3], channelObj.projectedPoints[0], color));

      // draw line for orientation

      let pointZero;
      let pointOne;
      let pointTwo;
      let pointThree;
      if (horizontal) {
          pointZero = channelObj.projectedPoints[4].clone();
          pointOne = channelObj.projectedPoints[5].clone();
          pointTwo = channelObj.projectedPoints[6].clone();
          pointThree = channelObj.projectedPoints[7].clone();
      } else {
          pointZero = channelObj.projectedPoints[6].clone();
          pointOne = channelObj.projectedPoints[4].clone();
          pointTwo = channelObj.projectedPoints[5].clone();
          pointThree = channelObj.projectedPoints[7].clone();
      }


      let startPoint = pointZero.add(pointThree.sub(pointZero).multiplyScalar(0.5));
      let startPointCloned = startPoint.clone();
      let helperPoint = pointOne.add(pointTwo.sub(pointOne).multiplyScalar(0.5));
      let helperPointCloned = helperPoint.clone();
      let endPoint = startPointCloned.add(helperPointCloned.sub(startPointCloned).multiplyScalar(0.2));
      lineArray.push(this.drawLine(channelIdx, startPoint, endPoint, color));


      // top four lines
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[4], channelObj.projectedPoints[5], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[5], channelObj.projectedPoints[6], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[6], channelObj.projectedPoints[7], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[7], channelObj.projectedPoints[4], color));

      // vertical lines
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[0], channelObj.projectedPoints[4], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[1], channelObj.projectedPoints[5], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[2], channelObj.projectedPoints[6], color));
      lineArray.push(this.drawLine(channelIdx, channelObj.projectedPoints[3], channelObj.projectedPoints[7], color));

      return lineArray;
  }

  takeScreenshot(){
      let imgData = renderer.domElement.toDataURL();
      const frameScreenshots = this.state.frameScreenshots;

      frameScreenshots.push(imgData);
  }


  getZipVideoFrames() {
      let zip = new JSZip();
      const frameScreenshots = this.state.frameScreenshots;
      // for (let i = 0; i < 899; i++) {
      for (let i = 0; i < 449; i++) {
          let substring = frameScreenshots[i].substring(22, frameScreenshots[i].length);
          let byteArray = Base64Binary.decodeArrayBuffer(substring);
          zip.file(this.pad(i, 6) + ".png", byteArray);
      }
      return zip;
  }

  initTimer = () => {
      const timeElapsed = this.state.timeElapsed;

      timeElapsed = 0;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let timeString = "";

      setInterval(function () {
          // increase elapsed time every second
          timeElapsed = this.state.timeElapsed + 1;
          seconds = this.state.timeElapsed % 60;
          minutes = Math.floor(this.state.timeElapsed / 60);
          if (minutes > 59) {
              minutes = 0;
          }
          hours = Math.floor(this.state.timeElapsed / (60 * 60));
          timeString = this.pad(hours, 2) + ":" + this.pad(minutes, 2) + ":" + this.pad(seconds, 2);
          $("#time-elapsed").text(timeString);
      }, this.state.timeDelay);
  }

  initScreenshotTimer = () => {
      this.state.timeElapsedScreenshot = 0;
      let screenshotIntervalHandle = setInterval(function () {
          // increase elapsed time every second
          this.state.timeElapsedScreenshot = this.state.timeElapsedScreenshot + 1;
          // take screenshot every 2 seconds
          if (this.state.takeCanvasScreenshot === true) {
              if (this.state.currentFileIndex < 899) {
                  // if (this.state.currentFileIndex < 450) {
                  this.takeScreenshot();
                  this.changeFrame(this.state.currentFileIndex + 1);
              } else {
                this.state.takeCanvasScreenshot = false;
                  let zip = this.getZipVideoFrames();
                  zip.generateAsync({type: "blob"})
                      .then(function (content) {
                          this.saveAs(content, this.state.currentDataset + "_" + this.state.currentSequence + '_video_frames.zip')
                      });
              }
          } else {
              clearInterval(screenshotIntervalHandle);
          }
      }, this.state.timeDelayScreenshot);
  }

  initPlayTimer = () => {
      this.state.timeElapsedPlay = 0;
      let playIntervalHandle = setInterval(function () {
          this.state.timeElapsedPlay = this.state.timeElapsedPlay + 1;
          if (this.state.playSequence === true) {
              if (this.state.currentFileIndex < 900) {
                  this.changeFrame(this.state.currentFileIndex + 1);
              } else {
                  clearInterval(playIntervalHandle);
              }
          } else {
              clearInterval(playIntervalHandle);
          }

      }, this.state.timeDelayPlay);
  }

  initFrameSelector = () => {
      // add bar segments to frame selection bar
      for (let i = 0; i < this.state.numFrames; i++) {
          let selectedClass = "";
          if (i === 0) {
              selectedClass = "selected";
          }
          let divElem = $("<div data-tip=" + i + " data-for=\"frame-selector\" class=\"frame default " + selectedClass + "\"></div>");
          $(divElem).on("click", function (item) {
              $("div.frame").attr("class", "frame default");
              item.target.className = "frame default selected";
              let elemIndex = Number(item.target.dataset.tip);
              this.changeFrame(elemIndex);
          });
          $(".frame-selector__frames").append(divElem);

      }
  }

  setPanelSize = (newFileIndex) => {
      let panelHeight = this.state.imageSizes["NuScenes"]["minHeightNormal"];
      $("#layout_layout_panel_top").css("height", panelHeight);
      $("#layout_layout_resizer_top").css("top", panelHeight);
      $("#layout_layout_panel_main").css("top", panelHeight);
      $("#image-cam-front-left").css("height", panelHeight);
      $("#image-cam-front").css("height", panelHeight);
      $("#image-cam-front-right").css("height", panelHeight);
      $("#image-cam-back-right").css("height", panelHeight);
      $("#image-cam-back").css("height", panelHeight);
      $("#image-cam-back-left").css("height", panelHeight);


      for (let i = 0; i < this.state.camChannels.length; i++) {
          let id = "#image-" + this.state.camChannels[i].channel.toLowerCase().replace(/_/g, '-');
          // bring all svgs into background
          let allSvg = $(id + " svg");
          for (let j = 0; j < allSvg.length; j++) {
              allSvg[j].style.zIndex = 0;
          }
          allSvg[this.state.numFrames - newFileIndex - 1].style.zIndex = 2;
          let imgWidth = window.innerWidth / 6;
          console.log("image_width_svg: " + imgWidth)
          allSvg[this.state.numFrames - newFileIndex - 1].style.width = imgWidth;
          allSvg[this.state.numFrames - newFileIndex - 1].style.height = imgWidth / this.state.imageAspectRatioNuScenes;
      }
  }

  render(){
    return(
      <pcdLabelTool 
        onInitialize = {()=>this.onInitialize}
        pointCloudLoaded = {this.state.pointCloudLoaded}
        removeObject = {()=>this.removeObject}
        drawFieldOfView = {()=>this.drawFieldOfView}
        showCameraPosition ={this.state.showCameraPosition}
        positionLidarNuscenes = {this.state.positionLidarNuscenes}
        createAnnotations = {() => this.createAnnotations}
        takeCanvasScreenshot = {this.state.takeCanvasScreenshot}
        changeFrame = {() => this.changeFrame}
        selectedMesh = {this.state.selectedMesh}
        createAnnotations = {() => this.createAnnotations}
        spriteArray = {this.state.spriteArray}
        cubeArray = {this.state.cubeArray}
        folderEndPosition = {this.state.folderEndPosition}
        folderEndSize = {this.state.folderEndSize}
        logger = {this.state.logger}
        playSequence = {this.state.playSequence}
        nextFrame = {() => this.nextFrame}
        camChannels = {this.state.camChannels}
        translationVectorLidarToCamFront = {this.state.translationVectorLidarToCamFront}
        reset = {()=>this.reset}
        start = {()=>this.start}
        savedFrames = {this.state.savedFrames}
        sequencesNuScenes = {this.state.sequencesNuScenes}
        showFieldOfView = {this.state.showFieldOfView}
        skipFrameCount = {this.state.skipFrameCount}
        paperArrayAll = {this.state.paperArrayAll}
        getDefaultObject = {()=>this.getDefaultObject}
      />,

      <boundingBox 
        removeObject = {()=>this.removeObject}
        cubeArray = {this.state.cubeArray}
        spriteArray = {this.state.spriteArray}
        selectedMesh = {this.state.selectedMesh}
        camChannels = {this.state.camChannels}
        paperArrayAll = {this.state.paperArrayAll}
        folderBoundingBox3DArray = {this.state.folderBoundingBox3DArray}
        folderPositionArray = {this.state.folderPositionArray}
        folderSizeArray = {this.state.folderSizeArray}
      />,

      <imageLabelTools 
        contents={this.state.contents}
        remove={()=>this.remove}
        selectEmpty={()=>this.selectEmpty}
        getSelectionIndex={()=>this.getSelectionIndex}
        cubeArray={this.state.cubeArray}
        addResizeEventForImage={()=>this.addResizeEventForImage}
        camChannels = {this.state.camChannels}
      />
    )
  }
}
