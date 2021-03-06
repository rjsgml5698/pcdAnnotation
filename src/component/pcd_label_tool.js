import React, { Component } from "react";
import BasebabelTool from "./base_label_tool.js";
import BoundingBox from './boundingbox.js';
import * as THREE from 'three';
import ClassesboundingBox from './classesBoundingBox.js';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
// import { PointerLockControls } from "three/examples/js/controls/PointerLockControls";
import { Projector } from "three/examples/jsm/renderers/Projector";
import * as dat from 'dat.gui';
import $ from 'jquery';
import { ConeBufferGeometry } from "three";
window.$ = $;

export default class pcdLabelTool extends Component {

  constructor(props){
    super(props);

    this.state = {
      canvasBEV : null,
      canvasSideView : null,
      canvasFrontView : null,
      views : null,
      grid : null,

      operationStack : [],

      orthographicCamera : null,
      perspectiveCamera : null,
      currentCamera : null,

      cameraBEV : null,
      cameraSideView : null,
      cameraFrontView : null,

      currentOrbitControls : null,
      controlsTarget : new THREE.Vector3(0, 0, 0),
      orthographicOrbitControls : null,
      perspectiveOrbitControls : null,
      pointerLockControls : null,
      pointerLockObject : null,
      transformControls : null,
      mapControlsBev : null,
      mapControlsFrontView : null,
      mapControlsSideView : null,

      scene : new THREE.Scene(),
      projector : null,

      
      //renderer :new THREE.Renderer,
      renderer : null,
      rendererBev : null,
      rendererSideView : null,
      rendererFrontView : null,

      clock : new THREE.Clock(),
      container : null,
      // keyboard : new THREE.KeyboardState(),
      moveForward : false,
      moveBackward : false,
      moveLeft : false,
      moveRight : false,
      moveUp : false,
      moveDown : false,
      rotateLeft : false,
      rotateRight : false,
      rotateUp : false,
      rotateDown : false,
      headerHeight : 0,
      translationVelocity : new THREE.Vector3(),
      rotationVelocity : new THREE.Vector3(),
      translationDirection : new THREE.Vector3(),
      rotationDirection : new THREE.Vector3(),
      prevTime : performance.now(),

      // let stats;
      cube : null,
      interpolationObjIndexCurrentFile : -1,
      interpolationObjIndexNextFile : -1,
      interpolateBtn : null,

      // let keyboard = new KeyboardState();

      // 사이드 메뉴 조작부분 현재는 주석처리
      // guiAnnotationClasses : new dat.GUI({autoPlace: true, width: 90, resizable: false}),
      //guiOptions : new dat.GUI({autoPlace: true, width: 350, resizable: false}),

      guiBoundingBoxAnnotationMap: null,
      guiOptionsOpened : true,
      numGUIOptions : 17,
      showProjectedPointsFlag : false,
      showGridFlag : false,
      filterGround : false,
      hideOtherAnnotations : false,
      interpolationMode : false,
      showDetections : false,
      folderBoundingBox3DArray : [],
      folderPositionArray : [],
      folderSizeArray : [],
      bboxFlag : true,
      clickFlag : false,
      clickedObjectIndex : -1,
      clickedObjectIndexPrevious : -1,
      mousePos : {x: 0, y: 0},
      intersectedObject : null,
      mouseDown : {x: 0, y: 0},
      mouseUp : {x: 0, y: 0},
      clickedPoint : THREE.Vector3(),
      groundPointMouseDown : null,
      groundPlaneArray : [],
      clickedPlaneArray : [],
      birdsEyeViewFlag : true,
      cls : 0,
      rotWorldMatrix : new THREE.Matrix4(),
      rotObjectMatrix : null,
      circleArray : [],
      colorMap : [],
      activeColorMap : 'colorMapJet.js',
      currentPoints3D : [],
      currentDistances : [],
      spriteBehindObject : null,
      pointCloudScanList : [],
      pointCloudScanNoGroundList : [],
      pointCloudScan : null,
      pointCloudScanNoGround : null,
      useTransformControls : null,
      dragControls : false,
      keyboardNavigation : false,
      canvas3D : null,
      parametersBoundingBox : {
        "Vehicle": function () {
          ClassesboundingBox.select("Vehicle");
            $('#class-picker ul li').css('background-color', '#323232');
            $($('#class-picker ul li')[0]).css('background-color', '#525252');
        },
        "Truck": function () {
          ClassesboundingBox.select("Truck");
            $('#class-picker ul li').css('background-color', '#323232');
            $($('#class-picker ul li')[1]).css('background-color', '#525252');
        },
        "Motorcycle": function () {
          ClassesboundingBox.select("Motorcycle");
            $('#class-picker ul li').css('background-color', '#323232');
            $($('#class-picker ul li')[2]).css('background-color', '#525252');
        },
        "Bicycle": function () {
          ClassesboundingBox.select("Bicycle");
            $('#class-picker ul li').css('background-color', '#323232');
            $($('#class-picker ul li')[3]).css('background-color', '#525252');
        },
        "Pedestrian": function () {
          ClassesboundingBox.select("Pedestrian");
            $('#class-picker ul li').css('background-color', '#323232');
            $($('#class-picker ul li')[4]).css('background-color', '#525252');
        },
      }
    }
  }

getObjectIndexByTrackIdAndClass = (trackId, className, fileIdx) => {
  for (let i = 0; i < this.props.contents[fileIdx].length; i++) {
      let obj = this.props.contents[fileIdx][i];
      if (obj["trackId"] === trackId && obj["class"] === className) {
          return i;
      }
  }
  return -1;
}

// labelTool은 base_babel_tools에 있음
componentDidMount(){
  console.log("pcd_props", this.props);
 
  this.init();
  //this.animate();

  this.loadPCDData();
}

init() {
  // 임시 주석
  //if (WEBGL.isWebGLAvailable() === false) {
  //    document.body.appendChild(WEBGL.getWebGLErrorMessage());
  //}

  /**
   * CameraControls
   */
  // function CameraControls() {
  //     //constructor
  // }

  // CameraControls.prototype = {
  //     constructor: CameraControls,
  //     update: function (camera, keyboard, clock) {
  //         //functionality to go here
  //         let delta = clock.getDelta(); // seconds.
  //         let moveDistance = 10 * delta; // 200 pixels per second
  //         let rotateAngle = delta;   // pi/2 radians (90 degrees) per second
  //         if (keyboard.pressed("w")) {
  //             // camera.translateZ(-moveDistance);
  //             let angle = Math.abs(camera.rotation.y + Math.PI / 2);
  //             let posX = camera.position.x + Math.cos(angle) * moveDistance;
  //             let posY = camera.position.y + Math.sin(angle) * moveDistance;
  //             camera.position.set(posX, posY, camera.position.z);
  //         }
  //         if (keyboard.pressed("s")) {
  //             let angle = Math.abs(camera.rotation.y + Math.PI / 2);
  //             moveDistance = -moveDistance;
  //             let posX = camera.position.x + Math.cos(angle) * moveDistance;
  //             let posY = camera.position.y + Math.sin(angle) * moveDistance;
  //             camera.position.set(posX, posY, camera.position.z);
  //             // camera.position.set(0, 0, camera.position.z + moveDistance);
  //             // camera.translateZ(moveDistance);
  //         }
  //         if (keyboard.pressed("a")) {
  //             camera.translateX(-moveDistance);//great!
  //         }
  //         if (keyboard.pressed("d")) {
  //             camera.translateX(moveDistance);//great!
  //         }
  //         if (keyboard.pressed("q")) {
  //             camera.position.z = camera.position.z - moveDistance;
  //         }
  //         if (keyboard.pressed("e")) {
  //             camera.position.z = camera.position.z + moveDistance;
  //         }
  //
  //         if (keyboard.pressed("left")) {
  //             camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
  //         }
  //         if (keyboard.pressed("right")) {
  //             camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
  //         }
  //         // if (keyboard.pressed("up")) {
  //         //     camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
  //         // }
  //         // if (keyboard.pressed("down")) {
  //         //     camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);
  //         // }
  //
  //
  //     }
  // };
  //
  // cameraControls = new CameraControls();
  // keyboard = new THREEx.KeyboardState();
  //const keyboard = new KeyboardState();
  //const clock = new THREE.Clock();
  // container = document.createElement('div');
  // document.body.appendChild(container);


  const scene = new THREE.Scene();
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;

  scene.background = new THREE.Color(0x323232);

  scene.fog = new THREE.Fog(scene.background, 3500, 15000);

  let axisHelper = new THREE.AxisHelper(1);
  axisHelper.position.set(0, 0, 0);
  scene.add(axisHelper);

  let light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, 0, 6).normalize();
  scene.add(light);

  const canvas3D = document.getElementById('canvas3d');

  if (birdsEyeViewFlag === false) {
      canvas3D.removeEventListener('keydown', this.canvas3DKeyDownHandler);
      canvas3D.addEventListener('keydown', this.canvas3DKeyDownHandler);
  }

  window.removeEventListener('keydown', this.keyDownHandler);
  window.addEventListener('keydown', this.keyDownHandler);

  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      clearColor: 0x000000,
      clearAlpha: 0,
      alpha: true,
      preserveDrawingBuffer: true
  });

  this.setState({
    renderer: renderer
  })

  // renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  this.setCamera();
  this.createGrid();

  if ($("#canvas3d").children().size() > 0) {
      $($("#canvas3d").children()[0]).remove();
  }
  canvas3D.appendChild(renderer.domElement);

  // stats = new Stats();
  // canvas3D.appendChild(stats.dom);
  window.addEventListener('resize', this.onWindowResize, false);
  window.addEventListener("contextmenu", function (e) {
      e.preventDefault();
  }, false);

  const projector = new Projector();
  canvas3D.addEventListener('mousemove', this.onDocumentMouseMove, false);

  canvas3D.onmousedown = function (ev) {
      this.handleMouseDown(ev);
  };

  canvas3D.onmouseup = function (ev) {
      this.handleMouseUp(ev);
  };

  //labelTool.cubeArray = [];
  //labelTool.spriteArray = [];
  //labelTool.savedFrames = [];
  const annotationObjects = this.state.annotationObjects;
  const guiBoundingBoxAnnotationMap = this.state.guiBoundingBoxAnnotationMap;
  const guiAnnotationClasses = this.state.guiAnnotationClasses;
  const parametersBoundingBox = this.state.parametersBoundingBox;
  const showProjectedPointsFlag = this.state.showProjectedPointsFlag;
  const showGridFlag = this.state.showGridFlag;
  const filterGround = this.state.filterGround;
  const grid = this.state.grid;
  const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
  const pointCloudScanNoGroundList = this.state.pointCloudScanNoGroundList;
  const interpolateBtn = this.state.interpolateBtn;
  const hideOtherAnnotations = this.state.hideOtherAnnotations;
  const folderPositionArray = this.state.folderPositionArray;
  const folderSizeArray = this.state.folderSizeArray;
  let interpolationMode = this.state.interpolationMode;

  const parameters = {
    download_video: () => {
        this.downloadVideo();
    },
    download: () => {
        this.download();
    },
    undo: () => {
        this.undoOperation();
    },
    i: -1,
    switch_view: () => {
        this.switchView();
    },
    datasets: this.state.datasets.NuScenes,
    sequences: "ONE",
    show_projected_points: false,
    show_nuscenes_labels: this.state.showOriginalNuScenesLabels,
    show_field_of_view: false,
    show_grid: false,
    filter_ground: false,
    hide_other_annotations: hideOtherAnnotations,
    select_all_copy_label_to_next_frame: () => {
        for (let i = 0; i < annotationObjects.contents[this.state.currentFileIndex].length; i++) {
            annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = true;
            let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
            checkboxElem.firstChild.checked = true;
        }
    },
    unselect_all_copy_label_to_next_frame: () => {
        for (let i = 0; i < annotationObjects.contents[this.state.currentFileIndex].length; i++) {
            // set all to false, expect the selected object (if interpolation mode active)
            let interpolationMode = this.state.interpolationMode;

            if (interpolationMode === false || i !== annotationObjects.getSelectionIndex()) {
                annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = false;
                let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
                checkboxElem.firstChild.checked = false;
                $(checkboxElem).children().first().removeAttr("checked");
            } else {
                annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = true;
                let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
                checkboxElem.firstChild.checked = true;
            }
        }
    },
    show_detections: false,
    interpolation_mode: false,
    interpolate: () => {
        if (interpolationMode === true) {
            this.interpolate();
        }
    },
    reset_all: () => {
        this.props.resetBoxes()
    },
    skip_frames: this.props.skipFrameCount
  };

  annotationObjects.contents = [];
  for (let i = 0; i < this.props.numFrames; i++) {
      this.props.cubeArray.push([]);
      this.props.spriteArray.push([]);
      this.props.savedFrames.push([]);
      annotationObjects.contents.push([]);
  }

  if (guiBoundingBoxAnnotationMap === undefined) {
      guiBoundingBoxAnnotationMap = {
          "Vehicle": guiAnnotationClasses.add(parametersBoundingBox, "Vehicle").name("Vehicle"),
          "Truck": guiAnnotationClasses.add(parametersBoundingBox, "Truck").name("Truck"),
          "Motorcycle": guiAnnotationClasses.add(parametersBoundingBox, "Motorcycle").name("Motorcycle"),
          "Bicycle": guiAnnotationClasses.add(parametersBoundingBox, "Bicycle").name("Bicycle"),
          "Pedestrian": guiAnnotationClasses.add(parametersBoundingBox, "Pedestrian").name("Pedestrian"),
      };
      guiAnnotationClasses.domElement.id = 'class-picker';
      // 3D BB controls
      //임시주석 = ui 부분
      //guiOptions.add(parameters, 'download').name("Download Annotations");
      //guiOptions.add(parameters, 'download_video').name("Download Video");
      //guiOptions.add(parameters, 'undo').name("Undo");
      //guiOptions.add(parameters, 'switch_view').name("Switch view");
      //let showOriginalNuScenesLabelsCheckbox = guiOptions.add(parameters, 'show_nuscenes_labels').name('NuScenes Labels').listen();
      let showOriginalNuScenesLabelsCheckbox;
      showOriginalNuScenesLabelsCheckbox.onChange( (value) => {
          this.props.showOriginalNuScenesLabels = value;
          if (this.props.showOriginalNuScenesLabels === true) {
              // TODO: improve:
              // - do not reset
              // - show current labels and in addition nuscenes labels
              this.props.reset();
              this.props.start();
          } else {
              // TODO: hide nuscenes labels (do not reset)
              this.props.reset();
              this.props.start();
          }
      });
      let allCheckboxes = $(":checkbox");
      let showNuScenesLabelsCheckbox = allCheckboxes[0];
      if (this.props.currentDataset === this.props.datasets.NuScenes) {
          this.enableShowNuscenesLabelsCheckbox(showNuScenesLabelsCheckbox);
      }
      let chooseSequenceDropDown;
      let guiOptions = this.state.guiOptions;

      console.log("guiOptions", guiOptions);

      guiOptions.add(parameters, 'datasets', ['NuScenes']).name("Choose dataset")
          .onChange( (value) => {
              this.changeDataset(value);
              let allCheckboxes = $(":checkbox");
              let showNuScenesLabelsCheckbox = allCheckboxes[0];
              if (value === this.props.datasets.NuScenes) {
                  this.enableShowNuscenesLabelsCheckbox(showNuScenesLabelsCheckbox);
                  this.disableChooseSequenceDropDown(chooseSequenceDropDown.domElement);
              }
              this.hideMasterView();
          });
      chooseSequenceDropDown = guiOptions.add(parameters, 'sequences', [
        this.props.sequencesNuScenes[0]]).name("Choose Sequence")
          .onChange( (value) => {
            this.changeSequence(value);
            this.hideMasterView();
          });

      let showFieldOfViewCheckbox = guiOptions.add(parameters, 'show_field_of_view').name('Field-Of-View').listen();
      showFieldOfViewCheckbox.onChange( (value) => {
        this.props.showFieldOfView = value;
          if (this.props.showFieldOfView === true) {
            this.props.removeObject('rightplane');
            this.props.removeObject('leftplane');
            this.props.removeObject('prism');
            this.props.drawFieldOfView();
          } else {
            this.props.removeObject('rightplane');
            this.props.removeObject('leftplane');
            this.props.removeObject('prism');
          }
      });
      let showProjectedPointsCheckbox = guiOptions.add(parameters, 'show_projected_points').name('Show projected points').listen();
      showProjectedPointsCheckbox.onChange( (value) => {
          showProjectedPointsFlag = value;
          if (showProjectedPointsFlag === true) {
              this.showProjectedPoints();
          } else {
              this.hideProjectedPoints();
          }
      });
      let showGridCheckbox = guiOptions.add(parameters, 'show_grid').name('Show grid').listen();
      showGridCheckbox.onChange( (value) => {
          showGridFlag = value;
          //let grid = scene.getObjectByName("grid");
          if (grid === undefined || grid.parent === null) {
              this.createGrid();
          }
          if (showGridFlag === true) {
              grid.visible = true;
          } else {
              grid.visible = false;
          }
      });
      let filterGroundCheckbox = guiOptions.add(parameters, 'filter_ground').name('Filter ground').listen();
      filterGroundCheckbox.onChange( (value) => {
          filterGround = value;
          if (filterGround === true) {
              this.props.removeObject("pointcloud-scan-" + this.props.currentFileIndex);
              this.addObject(pointCloudScanNoGroundList[this.props.currentFileIndex], "pointcloud-scan-no-ground-" + this.props.currentFileIndex);
          } else {
            this.props.removeObject("pointcloud-scan-no-ground-" + this.props.currentFileIndex);
            this.addObject(this.state.pointCloudScanList[this.props.currentFileIndex], "pointcloud-scan-" + this.props.currentFileIndex);
          }
      });

      let hideOtherAnnotationsCheckbox = guiOptions.add(parameters, 'hide_other_annotations').name('Hide other annotations').listen();
      hideOtherAnnotationsCheckbox.onChange( (value) => {
          hideOtherAnnotations = value;
          let selectionIndex = annotationObjects.getSelectionIndex();
          if (hideOtherAnnotations === true) {
              for (let i = 0; i < annotationObjects.contents[this.props.currentFileIndex].length; i++) {
                  // remove 3D labels
                  let mesh = this.props.cubeArray[this.props.currentFileIndex][i];
                  mesh.material.opacity = 0;
                  // remove all 2D labels
                  for (let j = 0; j < annotationObjects.contents[this.props.currentFileIndex][i].channels.length; j++) {
                      let channelObj = annotationObjects.contents[this.props.currentFileIndex][i].channels[j];
                      // remove drawn lines of all 6 channels
                      for (let lineObj in channelObj.lines) {
                          if (channelObj.lines.hasOwnProperty(lineObj)) {
                              let line = channelObj.lines[lineObj];
                              if (line !== undefined) {
                                  line.remove();
                              }
                          }
                      }
                  }
              }
              if (selectionIndex !== -1) {
                  // draw selected object in 2D and 3D
                  this.update2DBoundingBox(this.props.currentFileIndex, selectionIndex, true);
              }
          } else {
              for (let i = 0; i < annotationObjects.contents[this.props.currentFileIndex].length; i++) {
                  // show 3D labels
                  let mesh = this.props.cubeArray[this.props.currentFileIndex][i];
                  mesh.material.opacity = 0.9;
                  // show 2D labels
                  if (selectionIndex === i) {
                      // draw selected object in 2D and 3D
                      this.update2DBoundingBox(this.props.currentFileIndex, selectionIndex, true);
                  } else {
                      if (selectionIndex !== -1) {
                        this.update2DBoundingBox(this.props.currentFileIndex, i, false);
                      }
                  }

              }
          }

      });

      guiOptions.add(parameters, 'select_all_copy_label_to_next_frame').name("Select all 'Copy label to next frame'");
      guiOptions.add(parameters, 'unselect_all_copy_label_to_next_frame').name("Unselect all 'Copy label to next frame'");


      let interpolationModeCheckbox = guiOptions.add(parameters, 'interpolation_mode').name('Interpolation Mode');
      let interpolationMode = this.state.interpolationMode;
      let interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
      
      interpolationModeCheckbox.domElement.id = 'interpolation-checkbox';
      // if scene contains no objects then deactivate checkbox
      if (this.props.annotationFileExist(undefined, undefined) === false || interpolationMode === false) {
          // no annotation file exist -> deactivate checkbox
          this.disableInterpolationModeCheckbox(interpolationModeCheckbox.domElement);
      }

      interpolationModeCheckbox.onChange(function (value) {
          interpolationMode = value;
          if (interpolationMode === true) {
              interpolationObjIndexCurrentFile = annotationObjects.getSelectionIndex();
              if (interpolationObjIndexCurrentFile !== -1) {
                  // set interpolation start position
                  let obj = annotationObjects.contents[this.props.currentFileIndex][interpolationObjIndexCurrentFile];
                  obj["interpolationStart"]["position"]["x"] = obj["x"];
                  obj["interpolationStart"]["position"]["y"] = obj["y"];
                  obj["interpolationStart"]["position"]["z"] = obj["z"];
                  obj["interpolationStart"]["position"]["rotationY"] = obj["rotationY"];
                  obj["interpolationStart"]["size"]["width"] = obj["width"];
                  obj["interpolationStart"]["size"]["length"] = obj["length"];
                  obj["interpolationStart"]["size"]["height"] = obj["height"];
                  // short interpolation start index (Interpolation Start Position (frame 400)
                  folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + (this.props.currentFileIndex + 1) + ")";
                  folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + (this.props.currentFileIndex + 1) + ")";
                  // set start index
                  annotationObjects.contents[this.props.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"] = this.props.currentFileIndex;
              }
              // check 'copy label to next frame' of selected object
              annotationObjects.contents[this.props.currentFileIndex][interpolationObjIndexCurrentFile]["copyLabelToNextFrame"] = true;
              let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + interpolationObjIndexCurrentFile);
              checkboxElem.firstChild.checked = true;
              // disable checkbox
              this.disableCopyLabelToNextFrameCheckbox(checkboxElem);
          } else {
              this.disableInterpolationBtn();
              if (interpolationObjIndexCurrentFile !== -1) {
                  folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Position";
                  folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Size";
                  this.enableStartPositionAndSize();
                  //[1].__folders[""Interpolation End Position (frame 1)""]
                  for (let i = 0; i < folderBoundingBox3DArray.length; i++) {
                      // get all keys of folders object
                      let keys = Object.keys(folderBoundingBox3DArray[i].__folders);
                      for (let j = 0; j < keys.length; j++) {
                          if (keys[j].startsWith("Interpolation End")) {
                              folderBoundingBox3DArray[i].removeFolder(keys[j]);
                          }
                      }
                  }
                  // folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Position (frame " + (labelTool.previousFileIndex + 1) + ")");
                  // folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Size (frame " + (labelTool.previousFileIndex + 1) + ")");
                  // enable checkbox
                  let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + interpolationObjIndexCurrentFile);
                  this.enableCopyLabelToNextFrameCheckbox(checkboxElem);
              }
              interpolationObjIndexCurrentFile = -1;

          }
      });
      interpolateBtn = guiOptions.add(parameters, 'interpolate').name("Interpolate");
      interpolateBtn.domElement.id = 'interpolate-btn';
      this.disableInterpolationBtn();

      guiOptions.add(parameters, 'reset_all').name("Reset all");
      guiOptions.add(parameters, 'skip_frames').name("Skip frames").onChange(function (value) {
          if (value === "") {
              value = 1;
          } else {
              value = parseInt(value);
          }
          this.props.skipFrameCount = value;
      });


      guiOptions.domElement.id = 'bounding-box-3d-menu';
      // add download Annotations button
      let downloadAnnotationsItem = $($('#bounding-box-3d-menu ul li')[0]);
      let downloadAnnotationsDivItem = downloadAnnotationsItem.children().first();
      downloadAnnotationsDivItem.wrap("<a href=\"\"></a>");
      this.loadColorMap();
      if (showProjectedPointsFlag === true) {
          this.showProjectedPoints();
      } else {
          this.hideProjectedPoints();
      }
  }
  let classPickerElem = $('#class-picker ul li');
  classPickerElem.css('background-color', '#353535');
  $(classPickerElem[0]).css('background-color', '#525252');
  classPickerElem.css('border-bottom', '0px');

  let guiOptionsOpened = this.state.guiOptionsOpened;
  let guiOptions = this.state.guiOptions;

  $('#bounding-box-3d-menu').css('width', '480px');
  $('#bounding-box-3d-menu ul li').css('background-color', '#353535');
  $("#bounding-box-3d-menu .close-button").click(function () {
      guiOptionsOpened = !guiOptionsOpened;
      if (guiOptionsOpened === true) {
          $("#right-btn").css("right", 430);
      } else {
          $("#right-btn").css("right", -50);
      }
  });

  guiOptions.open();
  classPickerElem.each( (i, item) => {
      let propNamesArray = Object.getOwnPropertyNames(ClassesboundingBox);
      let color = ClassesboundingBox[propNamesArray[i]].color;
      let attribute = "20px solid" + ' ' + color;
      $(item).css("border-left", attribute);
      $(item).css('border-bottom', '0px');
  });

  // let elem = $("#label-tool-log");
  // elem.val("1. Draw bounding box ");
  // elem.css("color", "#969696");

  this.initViews();

}

interpolate = () => {
    const interpolationObjIndexCurrentFile = this.props.getSelectionIndex();
    const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
    const folderPositionArray = this.state.folderPositionArray;
    const folderSizeArray = this.state.folderSizeArray;
    
    let interpolationStartFileIndex = Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"]);
    if (interpolationStartFileIndex === -1) {
        this.props.logger.error("Interpolation failed. Select object to interpolate and try again.");
        return;
    }
    let numFrames = this.state.currentFileIndex - interpolationStartFileIndex;
    let objectIndexStartFile = this.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], interpolationStartFileIndex);
    let xDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["x"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["x"])) / numFrames;
    let yDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["y"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["y"])) / numFrames;
    let zDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["z"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["z"])) / numFrames;
    let rotationEnd = Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["rotationY"]);
    let rotationStart = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["rotationY"]);
    let rotationDelta = (rotationEnd - rotationStart) / numFrames;
    let widthDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["width"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["width"])) / numFrames;
    let lengthDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["length"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["length"])) / numFrames;
    let heightDelta = (Number(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["height"]) - Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["height"])) / numFrames;


    for (let i = 1; i < numFrames; i++) {
        // cloning
        let clonedObject = $.extend(true, {}, this.props.contents[interpolationStartFileIndex][objectIndexStartFile]);
        let clonedCubeObject = this.props.cubeArray[interpolationStartFileIndex][objectIndexStartFile].clone();
        let clonedSprite = this.props.spriteArray[interpolationStartFileIndex][objectIndexStartFile].clone();
        let objectIndexNextFrame = this.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], interpolationStartFileIndex + i);
        // use length>2 because 1. element is insertIndex
        if (this.props.contents[interpolationStartFileIndex + i] !== undefined && this.props.contents[interpolationStartFileIndex + i].length > 0 && objectIndexNextFrame !== -1) {
            // if frame contains some objects, then find object with same trackId and overwrite it
            this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame] = clonedObject;
            this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame] = clonedCubeObject;
            this.props.spriteArray[interpolationStartFileIndex + i][objectIndexNextFrame] = clonedSprite;
        } else {
            // else clone object to new frame and adjusts interpolated position and size
            this.props.contents[interpolationStartFileIndex + i].push(clonedObject);
            this.props.cubeArray[interpolationStartFileIndex + i].push(clonedCubeObject);
            this.props.spriteArray[interpolationStartFileIndex + i].push(clonedSprite);
            // recalculate index in next frame after cloning object
            objectIndexNextFrame = this.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], interpolationStartFileIndex + i);
        }

        let newX = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["x"]) + i * xDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["x"] = newX;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["position"]["x"] = newX;

        let newY = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["y"]) + i * yDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["y"] = newY;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["position"]["y"] = newY;

        let newZ = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["z"]) + i * zDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["z"] = newZ;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["position"]["z"] = newZ;

        let newRotation = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["position"]["rotationY"]) + i * rotationDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["rotationY"] = newRotation;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["rotation"]["z"] = newRotation;

        let newWidth = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["width"]) + i * widthDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["width"] = newWidth;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["scale"]["x"] = newWidth;

        let newLength = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["length"]) + i * lengthDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["length"] = newLength;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["scale"]["y"] = newLength;

        let newHeight = Number(this.props.contents[interpolationStartFileIndex][objectIndexStartFile]["interpolationStart"]["size"]["height"]) + i * heightDelta;
        this.props.contents[interpolationStartFileIndex + i][objectIndexNextFrame]["height"] = newHeight;
        this.props.cubeArray[interpolationStartFileIndex + i][objectIndexNextFrame]["scale"]["z"] = newHeight;
    }

    // Note: end frame index is the same as current file index
    // start position becomes current end position
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["position"]["x"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["x"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["position"]["y"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["y"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["position"]["z"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["z"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["position"]["rotationY"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["rotationY"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["size"]["x"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["x"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["size"]["y"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["y"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStart"]["size"]["z"] = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["z"];
    this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"] = this.state.currentFileIndex;
    // set current frame to start position and start size
    folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + (this.state.currentFileIndex + 1) + ")";
    folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + (this.state.currentFileIndex + 1) + ")";
    // enable start position and start size
    this.enableStartPositionAndSize();
    // remove end position folder and end position size
    folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Position (frame " + (this.props.previousFileIndex + 1) + ")");
    folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Size (frame " + (this.props.previousFileIndex + 1) + ")");
    // disable interpolate button
    this.disableInterpolationBtn();

    this.props.logger.success("Interpolation successfully!");
}

/**
 * The following operations can be undone:
 *  1. class label
 *  2. track ID
 *  3. delete object -> create it again
 *  4. position
 *  5. scale
 *  6. rotation
 *  7. reset (reset to previous position)
 *  8. add new object -> delete object
 *  9. interpolation (delete all non human annotations)
 *  10. change frame from 1 to 2 (go to prev. frame and remove all objects from frame 2 that were copied from frame 1)
 */
  undoOperation = () => {
    const operationStack = this.state.operationStack;

    // get the last operation from the stack which is implemented as a map with key value pairs
    // the value is represented as a json object
    if (operationStack.length === 0) {
        return;
    }
    let lastOperation = operationStack[operationStack.length - 1];
    let lastOperationType = lastOperation["type"];
    switch (lastOperationType) {
        case "classLabel":
            let objectIndex = Number(lastOperation["objectIndex"]);
            let previousClassLabel = lastOperation["previousClass"];
            this.props.changeClass(objectIndex, previousClassLabel);
            // select previous class in class picker
            break;
        case "trackId":
            break;
        case "delete":
            break;
        case "position":
            break;
        case "scale":
            break;
        case "rotation":
            break;
        case "reset":
            break;
        case "add":
            break;
        case "interpolation":
            break;
        case "changeFrame":
            break;
    }
    // remove operation from stack
    operationStack.splice(operationStack.length - 1, 1);

    if (operationStack.length === 0) {
        // TODO: disable undo button
    }
}

// parameters

// parameters = {
//     download_video: () => {
//         this.downloadVideo();
//     },
//     download: () => {
//         this.download();
//     },
//     undo: () => {
//         this.undoOperation();
//     },
//     i: -1,
//     switch_view: () => {
//         this.switchView();
//     },
//     datasets: this.state.datasets.NuScenes,
//     sequences: "ONE",
//     show_projected_points: false,
//     show_nuscenes_labels: this.state.showOriginalNuScenesLabels,
//     show_field_of_view: false,
//     show_grid: false,
//     filter_ground: false,
//     hide_other_annotations: hideOtherAnnotations,
//     select_all_copy_label_to_next_frame: () => {
//         for (let i = 0; i < annotationObjects.contents[this.state.currentFileIndex].length; i++) {
//             annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = true;
//             let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
//             checkboxElem.firstChild.checked = true;
//         }
//     },
//     unselect_all_copy_label_to_next_frame: () => {
//         for (let i = 0; i < annotationObjects.contents[this.state.currentFileIndex].length; i++) {
//             // set all to false, expect the selected object (if interpolation mode active)
//             if (interpolationMode === false || i !== annotationObjects.getSelectionIndex()) {
//                 annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = false;
//                 let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
//                 checkboxElem.firstChild.checked = false;
//                 $(checkboxElem).children().first().removeAttr("checked");
//             } else {
//                 annotationObjects.contents[this.state.currentFileIndex][i]["copyLabelToNextFrame"] = true;
//                 let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + i);
//                 checkboxElem.firstChild.checked = true;
//             }
//         }
//     },
//     show_detections: false,
//     interpolation_mode: false,
//     interpolate: () => {
//         if (interpolationMode === true) {
//             this.interpolate();
//         }
//     },
//     reset_all: () => {
//         this.props.resetBoxes()
//     },
//     skip_frames: labelTool.skipFrameCount
//   };

/*********** Event handlers **************/

// Rotate an object around an arbitrary axis in world space
rotateAroundWorldAxis = (object, axis, radians) => {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply
    object.matrix = rotWorldMatrix;
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}


rotateAroundObjectAxis = (object, axis, radians) => {
    const rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

PrismGeometry = (vertices, height) => {
    let shape = new THREE.Shape();
    (function f(ctx) {

        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);

    })(shape);

    let settings = {};
    settings.amount = height;
    settings.bevelEnabled = false;
    THREE.ExtrudeGeometry.call(this, shape, settings);

};

// PrismGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype);

addObject = (sceneObject, name) => {
  const scene = this.state.scene;
    sceneObject.name = name;
    // search whether object already exist
    for (let i = scene.children.length - 1; i >= 0; i--) {
        let obj = scene.children[i];
        if (obj.name === name) {
            return;
        }
    }
    scene.add(sceneObject);
}

drawCameraPosition = () => {
    let camFrontGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    camFrontGeometry.translate(-3.402 / 100, 60.7137 / 100, -10.4301 / 100);
    let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: false
    });
    let camFrontMesh = new THREE.Mesh(camFrontGeometry, material);
    this.addObject(camFrontMesh, 'cam-front-object');
    let camFrontRightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: false
    });
    // lat, long, vert
    camFrontRightGeometry.translate(59.35125262 / 100, 41.21713246 / 100, -15.43223025 / 100);
    let camFrontRightMesh = new THREE.Mesh(camFrontRightGeometry, material);
    this.addObject(camFrontRightMesh, 'cam-front-right-object');
    let camBackRightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        side: THREE.DoubleSide,
        transparent: false
    });
    camBackRightGeometry.translate(47.93776844 / 100, -90.71772718 / 100, -8.13149812 / 100);
    let camBackRightMesh = new THREE.Mesh(camBackRightGeometry, material);
    this.addObject(camBackRightMesh, 'cam-back-right-object');
    let camBackGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        transparent: false
    });
    camBackGeometry.translate(-4.07865574 / 100, -95.4603164 / 100, -13.38361257 / 100);
    let camBackMesh = new THREE.Mesh(camBackGeometry, material);
    this.addObject(camBackMesh, 'cam-back-object');
    let camBackLeftGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
        transparent: false
    });
    camBackLeftGeometry.translate(-75.37243686 / 100, -77.11760848 / 100, -15.77163041 / 100);
    let camBackLeftMesh = new THREE.Mesh(camBackLeftGeometry, material);
    this.addObject(camBackLeftMesh, 'cam-back-left-object');
    let camFrontLeftGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        side: THREE.DoubleSide,
        transparent: false
    });
    camFrontLeftGeometry.translate(-59.9910821 / 100, 50.67448108 / 100, -14.11259497 / 100);
    let camFrontLeftMesh = new THREE.Mesh(camFrontLeftGeometry, material);
    this.addObject(camFrontLeftMesh, 'cam-front-left-object');
}

// Visualize 2d and 3d data
loadPCDData = () => {
    const scene = this.state.scene;
    console.log("scene###!!!", scene);
    const pointCloudScanNoGroundList = this.state.pointCloudScanNoGroundList;
    const pointCloudScanList = this.state.pointCloudScanList;
    // ASCII pcd files
    let pcdLoader = new PCDLoader();
    let pointCloudFullURL;
    let pointCloudWithoutGroundURL;
    pointCloudWithoutGroundURL = 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/' + 'pointclouds_without_ground/' + this.state.fileNames[this.state.currentFileIndex] + '.pcd';

    // load all point cloud scans in the beginning
    if (this.props.pointCloudLoaded === false) {
        for (let i = 0; i < this.state.numFrames; i++) {
            pointCloudFullURL = 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/' + 'pointclouds/' + this.state.fileNames[i] + '.pcd';
            pcdLoader.load(pointCloudFullURL, function (mesh) {
                mesh.name = 'pointcloud-scan-' + i;
                pointCloudScanList.push(mesh);
                if (i === this.state.currentFileIndex) {
                    scene.add(mesh);
                }
            });
            pcdLoader.load(pointCloudWithoutGroundURL, function (mesh) {
                mesh.name = 'pointcloud-scan-no-ground-' + i;
                pointCloudScanNoGroundList.push(mesh);
            });
        }
        this.props.pointCloudLoaded = true;
    } else {
        scene.add(pointCloudScanList[this.state.currentFileIndex]);
    }


    // show FOV of camera within 3D pointcloud
    this.props.removeObject('rightplane');
    this.props.removeObject('leftplane');
    this.props.removeObject('prism');
    if (this.props.showFieldOfView === true) {
      this.props.drawFieldOfView();
    }

    // draw positions of cameras
    if (this.props.showCameraPosition === true) {
        this.drawCameraPosition();
    }

    // let mtlLoader = new MTLLoader();
    // let objLoader = new OBJLoader();

    // draw ego vehicle
    let lexusTexture = new THREE.TextureLoader().load('./assets/models/lexus/lexus.jpg');
    let lexusMaterial = new THREE.MeshBasicMaterial({map: lexusTexture});
    console.log("lexusTexture",lexusTexture)

    this.loadObjModel(lexusMaterial, './assets/models/lexus/lexus_hs.obj');

    let objLoader = new OBJLoader();
    objLoader.load('./assets/models/lexus/lexus_hs.obj', function (object) {
        let lexusGeometry = object.children[0].geometry;
        let lexusMesh = new THREE.Mesh(lexusGeometry, lexusMaterial);

        lexusMesh.scale.set(0.065, 0.065, 0.065);
        lexusMesh.rotation.set(0, 0, -Math.PI / 2);
        lexusMesh.position.set(0, 0, -this.props.positionLidarNuscenes[2]);

        scene.add(lexusMesh)
    });
}

loadObjModel = (materialURL, objectURL) => {
  new MTLLoader().load(materialURL, materials => {
    materials.preload();
    //materials.Material.side = THREE.DoubleSide;
    console.log("Loaded Materials");
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      objectURL,
      object => {
        //const root = object.detail.loaderRootNode;
        console.log("Loaded Obj" + object);
        let mesh = object;
        this.scene.add(object);
        mesh.position.set(0, 0, 0);
        mesh.scale.set(0.07, 0.07, 0.07);
      },
      xhr => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      error => {
        console.log("An error happened" + error);
      }
    );
  });
};

// this.props.onSelect = ("PCD", (selectionIndex) => {
  onSelect = ("PCD", (selectionIndex) => {

    const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
    const folderSizeArray = this.state.folderSizeArray;
    const folderPositionArray = this.state.folderPositionArray;
    const clickedPlaneArray = this.state.clickedPlaneArray;

    // clickedPlaneArray = [];
    for (let i = 0; i < folderBoundingBox3DArray.length; i++) {
        if (folderBoundingBox3DArray[i] !== undefined) {
            folderBoundingBox3DArray[i].close();
        }
    }
    if (folderBoundingBox3DArray[selectionIndex] !== undefined) {
        folderBoundingBox3DArray[selectionIndex].open();
    }
    if (folderPositionArray[selectionIndex] !== undefined) {
        folderPositionArray[selectionIndex].open();
    }
    if (folderSizeArray[selectionIndex] !== undefined) {
        folderSizeArray[selectionIndex].open();
    }
  });

// boundingbox에서 불럼
// annotationObjects.onChangeClass("PCD", function (index, label) {
onChangeClass = ("PCD", (index, label) => {
  this.props.cubeArray[this.state.currentFileIndex][index].material.color.setHex(ClassesboundingBox[label].color.replace("#", "0x"));
    // change also color of the bounding box
    this.props.cubeArray[this.state.currentFileIndex][index].children[0].material.color.setHex(ClassesboundingBox[label].color.replace("#", "0x"));
    this.props.contents[this.state.currentFileIndex][index]["class"] = label;
});

//add remove function in dat.GUI
// 임시 생략 - 고쳐야함
// dat.GUI.prototype.removeFolder = function (name) {
//     let folder = this.__folders[name];
//     if (!folder) {
//         return;
//     }

//     folder.close();
//     this.__ul.removeChild(folder.domElement.parentNode);
//     delete this.__folders[name];
//     this.onResize();
// };

//calculate inverse matrix
inverseMatrix = (inMax) => {
    let det = (inMax[0][0] * inMax[1][1] * inMax[2][2] * inMax[3][3]) + (inMax[0][0] * inMax[1][2] * inMax[2][3] * inMax[3][1]) + (inMax[0][0] * inMax[1][3] * inMax[2][1] * inMax[3][2])
        - (inMax[0][0] * inMax[1][3] * inMax[2][2] * inMax[3][1]) - (inMax[0][0] * inMax[1][2] * inMax[2][1] * inMax[3][3]) - (inMax[0][0] * inMax[1][1] * inMax[2][3] * inMax[3][2])
        - (inMax[0][1] * inMax[1][0] * inMax[2][2] * inMax[3][3]) - (inMax[0][2] * inMax[1][0] * inMax[2][3] * inMax[3][1]) - (inMax[0][3] * inMax[1][0] * inMax[2][1] * inMax[3][2])
        + (inMax[0][3] * inMax[1][0] * inMax[2][2] * inMax[3][1]) + (inMax[0][2] * inMax[1][0] * inMax[2][1] * inMax[3][3]) + (inMax[0][1] * inMax[1][0] * inMax[2][3] * inMax[3][2])
        + (inMax[0][1] * inMax[1][2] * inMax[2][0] * inMax[3][3]) + (inMax[0][2] * inMax[1][3] * inMax[2][0] * inMax[3][1]) + (inMax[0][3] * inMax[1][1] * inMax[2][0] * inMax[3][2])
        - (inMax[0][3] * inMax[1][2] * inMax[2][0] * inMax[3][1]) - (inMax[0][2] * inMax[1][1] * inMax[2][0] * inMax[3][3]) - (inMax[0][1] * inMax[1][3] * inMax[2][0] * inMax[3][2])
        - (inMax[0][1] * inMax[1][2] * inMax[2][3] * inMax[3][0]) - (inMax[0][2] * inMax[1][3] * inMax[2][1] * inMax[3][0]) - (inMax[0][3] * inMax[1][1] * inMax[2][2] * inMax[3][0])
        + (inMax[0][3] * inMax[1][2] * inMax[2][1] * inMax[3][0]) + (inMax[0][2] * inMax[1][1] * inMax[2][3] * inMax[3][0]) + (inMax[0][1] * inMax[1][3] * inMax[2][2] * inMax[3][0]);
    let inv00 = (inMax[1][1] * inMax[2][2] * inMax[3][3] + inMax[1][2] * inMax[2][3] * inMax[3][1] + inMax[1][3] * inMax[2][1] * inMax[3][2] - inMax[1][3] * inMax[2][2] * inMax[3][1] - inMax[1][2] * inMax[2][1] * inMax[3][3] - inMax[1][1] * inMax[2][3] * inMax[3][2]) / det;
    let inv01 = (-inMax[0][1] * inMax[2][2] * inMax[3][3] - inMax[0][2] * inMax[2][3] * inMax[3][1] - inMax[0][3] * inMax[2][1] * inMax[3][2] + inMax[0][3] * inMax[2][2] * inMax[3][1] + inMax[0][2] * inMax[2][1] * inMax[3][3] + inMax[0][1] * inMax[2][3] * inMax[3][2]) / det;
    let inv02 = (inMax[0][1] * inMax[1][2] * inMax[3][3] + inMax[0][2] * inMax[1][3] * inMax[3][1] + inMax[0][3] * inMax[1][1] * inMax[3][2] - inMax[0][3] * inMax[1][2] * inMax[3][1] - inMax[0][2] * inMax[1][1] * inMax[3][3] - inMax[0][1] * inMax[1][3] * inMax[3][2]) / det;
    let inv03 = (-inMax[0][1] * inMax[1][2] * inMax[2][3] - inMax[0][2] * inMax[1][3] * inMax[2][1] - inMax[0][3] * inMax[1][1] * inMax[2][2] + inMax[0][3] * inMax[1][2] * inMax[2][1] + inMax[0][2] * inMax[1][1] * inMax[2][3] + inMax[0][1] * inMax[1][3] * inMax[2][2]) / det;
    let inv10 = (-inMax[1][0] * inMax[2][2] * inMax[3][3] - inMax[1][2] * inMax[2][3] * inMax[3][0] - inMax[1][3] * inMax[2][0] * inMax[3][2] + inMax[1][3] * inMax[2][2] * inMax[3][0] + inMax[1][2] * inMax[2][0] * inMax[3][3] + inMax[1][0] * inMax[2][3] * inMax[3][2]) / det;
    let inv11 = (inMax[0][0] * inMax[2][2] * inMax[3][3] + inMax[0][2] * inMax[2][3] * inMax[3][0] + inMax[0][3] * inMax[2][0] * inMax[3][2] - inMax[0][3] * inMax[2][2] * inMax[3][0] - inMax[0][2] * inMax[2][0] * inMax[3][3] - inMax[0][0] * inMax[2][3] * inMax[3][2]) / det;
    let inv12 = (-inMax[0][0] * inMax[1][2] * inMax[3][3] - inMax[0][2] * inMax[1][3] * inMax[3][0] - inMax[0][3] * inMax[1][0] * inMax[3][2] + inMax[0][3] * inMax[1][2] * inMax[3][0] + inMax[0][2] * inMax[1][0] * inMax[3][3] + inMax[0][0] * inMax[1][3] * inMax[3][2]) / det;
    let inv13 = (inMax[0][0] * inMax[1][2] * inMax[2][3] + inMax[0][2] * inMax[1][3] * inMax[2][0] + inMax[0][3] * inMax[1][0] * inMax[2][2] - inMax[0][3] * inMax[1][2] * inMax[2][0] - inMax[0][2] * inMax[1][0] * inMax[2][3] - inMax[0][0] * inMax[1][3] * inMax[2][2]) / det;
    let inv20 = (inMax[1][0] * inMax[2][1] * inMax[3][3] + inMax[1][1] * inMax[2][3] * inMax[3][0] + inMax[1][3] * inMax[2][0] * inMax[3][1] - inMax[1][3] * inMax[2][1] * inMax[3][0] - inMax[1][1] * inMax[2][0] * inMax[3][3] - inMax[1][0] * inMax[2][3] * inMax[3][1]) / det;
    let inv21 = (-inMax[0][0] * inMax[2][1] * inMax[3][3] - inMax[0][1] * inMax[2][3] * inMax[3][0] - inMax[0][3] * inMax[2][0] * inMax[3][1] + inMax[0][3] * inMax[2][1] * inMax[3][0] + inMax[0][1] * inMax[2][0] * inMax[3][3] + inMax[0][0] * inMax[2][3] * inMax[3][1]) / det;
    let inv22 = (inMax[0][0] * inMax[1][1] * inMax[3][3] + inMax[0][1] * inMax[1][3] * inMax[3][0] + inMax[0][3] * inMax[1][0] * inMax[3][1] - inMax[0][3] * inMax[1][1] * inMax[3][0] - inMax[0][1] * inMax[1][0] * inMax[3][3] - inMax[0][0] * inMax[1][3] * inMax[3][1]) / det;
    let inv23 = (-inMax[0][0] * inMax[1][1] * inMax[2][3] - inMax[0][1] * inMax[1][3] * inMax[2][0] - inMax[0][3] * inMax[1][0] * inMax[2][1] + inMax[0][3] * inMax[1][1] * inMax[2][0] + inMax[0][1] * inMax[1][0] * inMax[2][3] + inMax[0][0] * inMax[1][3] * inMax[2][1]) / det;
    let inv30 = (-inMax[1][0] * inMax[2][1] * inMax[3][2] - inMax[1][1] * inMax[2][2] * inMax[3][0] - inMax[1][2] * inMax[2][0] * inMax[3][1] + inMax[1][2] * inMax[2][1] * inMax[3][0] + inMax[1][1] * inMax[2][0] * inMax[3][2] + inMax[1][0] * inMax[2][2] * inMax[3][1]) / det;
    let inv31 = (inMax[0][0] * inMax[2][1] * inMax[3][2] + inMax[0][1] * inMax[2][2] * inMax[3][0] + inMax[0][2] * inMax[2][0] * inMax[3][1] - inMax[0][2] * inMax[2][1] * inMax[3][0] - inMax[0][1] * inMax[2][0] * inMax[3][2] - inMax[0][0] * inMax[2][2] * inMax[3][1]) / det;
    let inv32 = (-inMax[0][0] * inMax[1][1] * inMax[3][2] - inMax[0][1] * inMax[1][2] * inMax[3][0] - inMax[0][2] * inMax[1][0] * inMax[3][1] + inMax[0][2] * inMax[1][1] * inMax[3][0] + inMax[0][1] * inMax[1][0] * inMax[3][2] + inMax[0][0] * inMax[1][2] * inMax[3][1]) / det;
    let inv33 = (inMax[0][0] * inMax[1][1] * inMax[2][2] + inMax[0][1] * inMax[1][2] * inMax[2][0] + inMax[0][2] * inMax[1][0] * inMax[2][1] - inMax[0][2] * inMax[1][1] * inMax[2][0] - inMax[0][1] * inMax[1][0] * inMax[2][2] - inMax[0][0] * inMax[1][2] * inMax[2][1]) / det;

    return [[inv00, inv01, inv02, inv03], [inv10, inv11, inv12, inv13], [inv20, inv21, inv22, inv23], [inv30, inv31, inv32, inv33]]
}

b64EncodeUnicode = (str) => {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

// right padding s with c to a total of n chars
// print 0.12300
// alert(padding_right('0.123', '0', 5));
paddingRight = (s, c, n) => {
    if (!s || !c || s.length >= n) {
        return s;
    }
    let max = (n - s.length) / c.length;
    for (let i = 0; i < max; i++) {
        s += c;
    }
    return s;
}

download = () => {
    let annotations = this.props.createAnnotations();
    let outputString = JSON.stringify(annotations);
    outputString = this.b64EncodeUnicode(outputString);
    $($('#bounding-box-3d-menu ul li')[0]).children().first().attr('href', 'data:application/octet-stream;base64,' + outputString).attr('download', this.state.currentDataset + "_" + this.state.currentSequence + '_annotations.txt');
}

// TODO: test
downloadVideo = () => {
    if (this.state.currentDataset === this.state.datasets.NuScenes) {
      this.props.takeCanvasScreenshot = true;
      this.props.changeFrame(0);
        this.initScreenshotTimer();
    }
}

hideMasterView = () => {
    $("#canvasSideView").hide();
    $("#canvasFrontView").hide();
    $("#canvasBev").hide();
}

//change camera position to bird view position
switchView = () => {
  const transformControls = this.state.transformControls;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;

    birdsEyeViewFlag = !birdsEyeViewFlag;

    if (transformControls !== undefined) {
      this.props.selectedMesh = undefined;
        transformControls.detach();
        transformControls = undefined;
        this.hideMasterView();
    }
    this.setCamera();
    this.props.removeObject("planeObject");
}

increaseBrightness = (hex, percent) => {
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    let r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}


addClassTooltip = (fileIndex, className, trackId, color, bbox) => {
    const scene = this.state.scene;
    let classTooltipElement = $("<div class='class-tooltip' id='tooltip-" + className.charAt(0) + trackId + "'>" + trackId + "</div>");
    // Sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(bbox.x + bbox.width / 2, bbox.y + bbox.length / 2, bbox.z + bbox.height / 2);
    sprite.scale.set(1, 1, 1);
    sprite.name = "sprite-" + className.charAt(0) + trackId;

    // add tooltip only to DOM if fileIndex is equal to current file index
    if (fileIndex === this.state.currentFileIndex) {
        $("body").append(classTooltipElement);
        scene.add(sprite);
    }
    this.props.spriteArray[fileIndex].push(sprite);
}

// boundingbox에 해당 함수 사용
get3DLabel = (parameters) => {
    let bbox = parameters;
    let cubeGeometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);//width, length, height
    const scene = this.state.scene;

    let color;
    if (parameters.fromFile === true) {
        if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
            color = ClassesboundingBox.content[parameters.class].color;
        } else {
            color = ClassesboundingBox[parameters.class].color;
        }
    } else {
        color = ClassesboundingBox.target().color;
    }

    let cubeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });

    let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(bbox.x, bbox.y, bbox.z);
    cubeMesh.scale.set(bbox.width, bbox.length, bbox.height);
    cubeMesh.rotation.z = bbox.rotationY;
    cubeMesh.name = "cube-" + parameters.class.charAt(0) + parameters.trackId;

    // get bounding box from object
    let boundingBoxColor = this.increaseBrightness(color, 50);
    let edgesGeometry = new THREE.EdgesGeometry(cubeMesh.geometry);
    let edgesMaterial = new THREE.LineBasicMaterial({color: boundingBoxColor, linewidth: 4});
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cubeMesh.add(edges);

    // add object only to scene if file index is equal to current file index
    if (parameters.fileIndex === this.state.currentFileIndex) {
        scene.add(cubeMesh);
        this.addBoundingBoxGui(bbox, undefined);
    }
    // class tooltip
    this.addClassTooltip(parameters.fileIndex, parameters.class, parameters.trackId, color, bbox);
    this.props.cubeArray[parameters.fileIndex].push(cubeMesh);
    return bbox;
}

update2DBoundingBox = (fileIndex, objectIndex, isSelected) => {
    let className = this.props.contents[fileIndex][objectIndex].class;
    for (let channelObject in this.props.contents[fileIndex][objectIndex].channels) {
        if (this.props.contents[fileIndex][objectIndex].channels.hasOwnProperty(channelObject)) {
            let channelObj = this.props.contents[fileIndex][objectIndex].channels[channelObject];
            if (channelObj.channel !== '') {
                let x = this.props.contents[fileIndex][objectIndex]["x"];
                let y = this.props.contents[fileIndex][objectIndex]["y"];
                let z = this.props.contents[fileIndex][objectIndex]["z"];
                let width = this.props.contents[fileIndex][objectIndex]["width"];
                let length = this.props.contents[fileIndex][objectIndex]["length"];
                let height = this.props.contents[fileIndex][objectIndex]["height"];
                let rotationY = this.props.contents[fileIndex][objectIndex]["rotationY"];
                let channel = channelObj.channel;
                channelObj.projectedPoints = this.calculateProjectedBoundingBox(x, y, z, width, length, height, channel, rotationY);
                // remove previous drawn lines of all 6 channels
                for (let lineObj in channelObj.lines) {
                    if (channelObj.lines.hasOwnProperty(lineObj)) {
                        let line = channelObj.lines[lineObj];
                        if (line !== undefined) {
                            line.remove();
                        }
                    }
                }
                if (channelObj.projectedPoints !== undefined && channelObj.projectedPoints.length === 8) {
                    let horizontal = width > height;
                    channelObj.lines = this.calculateAndDrawLineSegments(channelObj, className, horizontal, isSelected);
                }
            }
        }
    }
}

// function updateChannels(insertIndex) {
// let annotationObj = annotationObjects.contents[this.state.currentFileIndex][insertIndex];
// let posX = annotationObj.x;
// let posY = annotationObj.y;
// let posZ = annotationObj.z;
// let channels = getChannelsByPosition(posX, posY, posZ);
// annotationObj.channels[0].channel = channels[0];
// if (channels[1] !== undefined) {
//     annotationObj.channels[1].channel = channels[1];
// }
// }

updateXPos = (newFileIndex, value) => {
  const interpolationObjIndexNextFile = this.state.interpolationObjIndexNextFile;
  const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
  this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.x = value;
  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["x"] = value;
  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["x"] = value;
    // update bounding box
    this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
}

/**
 * calculates the highest available track id for a specific class
 * @param label
 */
 setHighestAvailableTrackId = (label) => {
    for (let newTrackId = 1; newTrackId <= this.props.contents[this.state.currentFileIndex].length; newTrackId++) {
        let exist = false;
        for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
            if (label === this.props.contents[this.state.currentFileIndex][i]["class"] && newTrackId === this.props.contents[this.state.currentFileIndex][i]["trackId"]) {
                exist = true;
                break;
            }
        }
        if (exist === false) {
            // track id was not used yet
            if (this.state.showOriginalNuScenesLabels === true) {
              ClassesboundingBox.content[label].nextTrackId = newTrackId;
            } else {
              ClassesboundingBox[label].nextTrackId = newTrackId;
            }
            break;
        }
        if (this.state.showOriginalNuScenesLabels === true) {
          ClassesboundingBox.content[label].nextTrackId = this.props.contents[this.state.currentFileIndex].length + 1;
        } else {
          ClassesboundingBox[label].nextTrackId = this.props.contents[this.state.currentFileIndex].length + 1;
        }
    }
}

getSmallestTrackId = (classNameToFind) => {
    let trackIds = [];
    for (let i = 0; i < this.props.contents.length; i++) {
        for (let j = 0; j < this.props.contents[i].length; j++) {
            let className = this.props.contents[i][j]["class"];
            if (className === classNameToFind) {
                let trackId = this.props.contents[i][j]["trackId"];
                if ($.inArray(trackId, trackIds) === -1) {
                    trackIds.push(trackId);
                }
            }

        }
    }
    trackIds.sort();
    for (let smallestAvailableTrackId = 1; smallestAvailableTrackId <= trackIds[trackIds.length - 1]; smallestAvailableTrackId++) {
        let exist = false;
        for (let j = 0; j < trackIds.length; j++) {
            if (smallestAvailableTrackId === trackIds[j]) {
                exist = true;
                break;
            }
        }
        if (exist === false) {
            return smallestAvailableTrackId;
        }
    }
    // return next highest track id
    return trackIds[trackIds.length - 1] + 1;
}

deleteObject = (bboxClass, trackId, labelIndex) => {
  const transformControls = this.state.transformControls;
  const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
  const folderSizeArray = this.state.folderSizeArray;
  const interpolationMode = this.state.interpolationMode;
  // const guiOptions = this.state.guiOptions;
  const folderPositionArray = this.state.folderPositionArray;


    // guiOptions.removeFolder(bboxClass + ' ' + trackId);
    // hide 3D bounding box instead of removing it (in case redo button will be pressed)
    if (transformControls !== undefined) {
        transformControls.detach();
    }

    this.props.removeObject("transformControls");
    // NOTE: already removed in annotationObjects.remove()
    //labelTool.cubeArray[this.state.currentFileIndex].splice(labelIndex, 1);
    let channels = this.props.contents[this.state.currentFileIndex][labelIndex].channels;
    // iterate all channels and remove projection
    for (let channelIdx in channels) {
        if (channels.hasOwnProperty(channelIdx)) {
            let channelObj = channels[channelIdx];
            for (let lineObj in channelObj.lines) {
                if (channelObj.lines.hasOwnProperty(lineObj)) {
                    let line = channelObj.lines[lineObj];
                    if (line !== undefined) {
                        line.remove();
                    }
                }
            }
        }
    }
    this.props.remove(labelIndex);
    folderBoundingBox3DArray.splice(labelIndex, 1);
    folderPositionArray.splice(labelIndex, 1);
    folderSizeArray.splice(labelIndex, 1);
    this.props.selectEmpty();
    this.props.spriteArray[this.state.currentFileIndex].splice(labelIndex, 1);
    this.props.removeObject("sprite-" + bboxClass.charAt(0) + trackId);
    // NOTE: already removed in annotationObjects.remove()
    //labelTool.removeObject("cube-" + bboxClass.charAt(0) + trackId);
    // remove sprite from DOM tree
    $("#tooltip-" + bboxClass.charAt(0) + trackId).remove();
    this.props.selectedMesh = undefined;
    // reduce track id by 1 for this class
    if (this.state.showOriginalNuScenesLabels) {
      ClassesboundingBox.content[bboxClass].nextTrackId--;
    } else {
        if (labelIndex === this.props.contents[this.state.currentFileIndex].length) {
            // decrement track id if the last object in the list was deleted
            ClassesboundingBox[bboxClass].nextTrackId--;
        } else {
            // otherwise not last object was deleted -> find out the highest possible track id
            this.setHighestAvailableTrackId(bboxClass);
        }
    }
    // if last object in current frame was deleted than disable interpolation mode
    if (this.props.contents[this.state.currentFileIndex].length === 0) {
        interpolationMode = false;
        $("#interpolation-checkbox").children().first().prop("checked", false);
        $("#interpolation-checkbox").children().first().removeAttr("checked");
    }
    //rename all ids following after insertIndexof
    // e.g. rename copy-label-to-next-frame-checkbox-1 to copy-label-to-next-frame-checkbox-0 if deleting first element
    let copyIdList = document.querySelectorAll('[id^="copy-label-to-next-frame-checkbox-"]'); // e.g. 0,1
    for (let i = labelIndex; i < this.props.contents[this.state.currentFileIndex].length; i++) {
        let idToChange = copyIdList[i].id;
        let elem = document.getElementById(idToChange);
        elem.id = "copy-label-to-next-frame-checkbox-" + (i);
    }
    // hide master view
    $("#canvasBev").hide();
    $("#canvasSideView").hide();
    $("#canvasFrontView").hide();
    // move class picker to left
    $("#class-picker").css("left", 10);
    this.props.__selectionIndexCurrentFrame = -1;
}

//register new bounding box
addBoundingBoxGui = (bbox, bboxEndParams) => {
  const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
  const interpolationObjIndexNextFile = this.state.interpolationObjIndexNextFile;
  const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
  const folderPositionArray = this.state.folderPositionArray;
  const folderSizeArray = this.state.folderSizeArray;
  const interpolationMode = this.state.interpolationMode;
  // const guiOptions = this.state.guiOptions;


    let insertIndex = folderBoundingBox3DArray.length;
    // 임시 주석
    // let bb = guiOptions.addFolder(bbox.class + ' ' + bbox.trackId);
    // folderBoundingBox3DArray.push(bb);

    let minXPos = -100;
    let minYPos = -100;
    let minZPos = -3;
    let maxXPos = 100;
    let maxYPos = 100;
    let maxZPos = 3;

    let folderPosition = folderBoundingBox3DArray[insertIndex].addFolder('Position');
    let cubeX = folderPosition.add(bbox, 'x').name("x").min(minXPos).max(maxXPos).step(0.01).listen();
    let cubeY = folderPosition.add(bbox, 'y').name("y").min(minYPos).max(maxYPos).step(0.01).listen();
    let cubeZ = folderPosition.add(bbox, 'z').name("z").min(minZPos).max(maxZPos).step(0.01).listen();
    let cubeYaw = folderPosition.add(bbox, 'rotationY').name("rotation").min(-Math.PI).max(Math.PI).step(0.01).listen();
    folderPosition.close();
    folderPositionArray.push(folderPosition);

    let folderSize = folderBoundingBox3DArray[insertIndex].addFolder('Size');
    let cubeWidth = folderSize.add(bbox, 'width').name("width").min(0.3).max(20).step(0.01).listen();
    let cubeLength = folderSize.add(bbox, 'length').name("length").min(0.3).max(20).step(0.01).listen();
    let cubeHeight = folderSize.add(bbox, 'height').name("height").min(0.3).max(20).step(0.01).listen();
    folderSize.close();
    folderSizeArray.push(folderSize);

    cubeX.onChange(function (value) {
        if (value >= minXPos && value < maxXPos) {
            // Note: Do not use insertIndex because it might change (if deleting e.g. an object in between)
            // use track id and class to calculate selection index
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
            this.props.cubeArray[this.state.currentFileIndex][selectionIndex].position.x = value;
            this.props.contents[this.state.currentFileIndex][selectionIndex]["x"] = value;
            // update bounding box
            this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
        }
    });
    cubeY.onChange(function (value) {
        if (value >= minYPos && value < maxYPos) {
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
            this.props.cubeArray[this.state.currentFileIndex][selectionIndex].position.y = value;
            this.props.contents[this.state.currentFileIndex][selectionIndex]["y"] = value;
            // update bounding box
            this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
        }
    });
    cubeZ.onChange(function (value) {
        if (value >= minZPos && value < maxZPos) {
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
            this.props.cubeArray[this.state.currentFileIndex][selectionIndex].position.z = value;
            this.props.contents[this.state.currentFileIndex][selectionIndex]["z"] = value;
            // update bounding box
            this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
        }
    });
    cubeYaw.onChange(function (value) {
        let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
        this.props.cubeArray[this.state.currentFileIndex][selectionIndex].rotation.z = value;
        this.props.contents[this.state.currentFileIndex][selectionIndex]["rotationY"] = value;
        // update bounding box
        this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
    });
    cubeWidth.onChange(function (value) {
        for (let i = 0; i < this.state.numFrames; i++) {
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, i);
            if (selectionIndex !== -1) {
                let newXPos = this.props.cubeArray[i][selectionIndex].position.x + (value - this.props.cubeArray[i][selectionIndex].scale.x) * Math.cos(this.props.cubeArray[i][selectionIndex].rotation.z) / 2;
                this.props.cubeArray[i][selectionIndex].position.x = newXPos;
                if (i === this.state.currentFileIndex) {
                    bbox.x = newXPos;
                }
                this.props.contents[i][selectionIndex]["x"] = newXPos;
                let newYPos = this.props.cubeArray[i][selectionIndex].position.y + (value - this.props.cubeArray[i][selectionIndex].scale.x) * Math.sin(this.props.cubeArray[i][selectionIndex].rotation.z) / 2;
                this.props.cubeArray[i][selectionIndex].position.y = newYPos;
                if (i === this.state.currentFileIndex) {
                    bbox.y = newYPos;
                }
                this.props.contents[i][selectionIndex]["y"] = newYPos;
                this.props.cubeArray[i][selectionIndex].scale.x = value;
                this.props.contents[i][selectionIndex]["width"] = value;
            }
        }
        let selectionIndexCurrentFrame = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
        this.update2DBoundingBox(this.state.currentFileIndex, selectionIndexCurrentFrame, true);
    });
    cubeLength.onChange(function (value) {
        for (let i = 0; i < this.state.numFrames; i++) {
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, i);
            if (selectionIndex !== -1) {
                let newXPos = this.props.cubeArray[i][selectionIndex].position.x + (value - this.props.cubeArray[i][selectionIndex].scale.y) * Math.sin(this.props.cubeArray[i][selectionIndex].rotation.z) / 2;
                this.props.cubeArray[i][selectionIndex].position.x = newXPos;
                bbox.x = newXPos;
                this.props.contents[i][selectionIndex]["x"] = newXPos;
                let newYPos = this.props.cubeArray[i][selectionIndex].position.y - (value - this.props.cubeArray[i][selectionIndex].scale.y) * Math.cos(this.props.cubeArray[i][selectionIndex].rotation.z) / 2;
                this.props.cubeArray[i][selectionIndex].position.y = newYPos;
                bbox.y = newYPos;
                this.props.contents[i][selectionIndex]["y"] = newYPos;
                this.props.cubeArray[i][selectionIndex].scale.y = value;
                this.props.contents[i][selectionIndex]["length"] = value;
            }
        }
        let selectionIndexCurrent = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
        this.update2DBoundingBox(this.state.currentFileIndex, selectionIndexCurrent, true);
    });
    cubeHeight.onChange(function (value) {
        for (let i = 0; i < this.state.numFrames; i++) {
            let selectionIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, i);
            let newZPos = this.props.cubeArray[i][selectionIndex].position.z + (value - this.props.cubeArray[i][selectionIndex].scale.z) / 2;
            this.props.cubeArray[i][selectionIndex].position.z = newZPos;
            bbox.z = newZPos;
            this.props.cubeArray[i][selectionIndex].scale.z = value;
            this.props.contents[i][selectionIndex]["height"] = value;
        }
        let selectionIndexCurrent = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
        this.update2DBoundingBox(this.state.currentFileIndex, selectionIndexCurrent, true);

    });

    if (bboxEndParams !== undefined && interpolationMode === true) {
        //interpolationObjIndexCurrentFile = annotationObjects.getSelectionIndex();
        interpolationObjIndexNextFile = this.getObjectIndexByTrackIdAndClass(this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["trackId"], this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["class"], bboxEndParams.newFileIndex);
        // change text
        let interpolationStartFileIndex = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"];
        folderPositionArray[interpolationObjIndexNextFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + interpolationStartFileIndex + ")";
        folderSizeArray[interpolationObjIndexNextFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + interpolationStartFileIndex + ")";

        if (interpolationStartFileIndex !== bboxEndParams.newFileIndex) {
            this.disableStartPositionAndSize();
            // add folders for end position and end size
            this.props.folderEndPosition = folderBoundingBox3DArray[interpolationObjIndexNextFile].addFolder("Interpolation End Position (frame " + (this.state.currentFileIndex + 1) + ")");
            let cubeEndX = this.props.folderEndPosition.add(bboxEndParams, 'x').name("x").min(minXPos).max(maxXPos).step(0.01).listen();
            let cubeEndY = this.props.folderEndPosition.add(bboxEndParams, 'y').name("y").min(minYPos).max(maxYPos).step(0.01).listen();
            let cubeEndZ = this.props.folderEndPosition.add(bboxEndParams, 'z').name("z)").min(minZPos).max(maxZPos).step(0.01).listen();
            let cubeEndYaw = this.props.folderEndPosition.add(bboxEndParams, 'rotationY').name("rotation").min(-Math.PI).max(Math.PI).step(0.01).listen();
            this.props.folderEndPosition.domElement.id = 'interpolation-end-position-folder';
            this.props.folderEndPosition.open();
            this.props.folderEndSize = folderBoundingBox3DArray[interpolationObjIndexNextFile].addFolder("Interpolation End Size (frame " + (this.state.currentFileIndex + 1) + ")");
            let cubeEndWidth = this.props.folderEndSize.add(bboxEndParams, 'width').name("width").min(0.3).max(20).step(0.01).listen();
            let cubeEndLength = this.props.folderEndSize.add(bboxEndParams, 'length').name("length").min(0.3).max(20).step(0.01).listen();
            let cubeEndHeight = this.props.folderEndSize.add(bboxEndParams, 'height').name("height").min(0.3).max(20).step(0.01).listen();
            this.props.folderEndPosition.domElement.id = 'interpolation-end-size-folder';
            this.props.folderEndSize.open();
            let newFileIndex = bboxEndParams.newFileIndex;

            cubeEndX.onChange(function (value) {
                if (value >= minXPos && value < maxXPos) {
                    this.updateXPos(newFileIndex, value);
                }
            });
            cubeEndY.onChange(function (value) {
                if (value >= minYPos && value < maxYPos) {
                  this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.y = value;
                  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["y"] = value;
                  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["y"] = value;
                    // update bounding box
                    this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
                }
            });
            cubeEndZ.onChange(function (value) {
                if (value >= minZPos && value < maxZPos) {
                  this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.z = value;
                  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["z"] = value;
                  this.props.contents[newFileIndex][interpolationObjIndexNextFile]["z"] = value;
                    // update bounding box
                    this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
                }
            });
            cubeEndYaw.onChange(function (value) {
              this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].rotation.z = value;
              this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["rotationY"] = value;
              this.props.contents[newFileIndex][interpolationObjIndexNextFile]["rotationY"] = value;
                // update bounding box
                this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
            });
            cubeEndWidth.onChange(function (value) {
                let newXPos = this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.x + (value - this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.x)
                    * Math.cos(this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].rotation.z) / 2;
                    this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.x = newXPos;
                    this.props.cubeArray[this.state.currentFileIndex][interpolationObjIndexCurrentFile].position.x = newXPos;

                    this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["x"] = newXPos;
                    this.props.contents[newFileIndex][interpolationObjIndexNextFile]["x"] = newXPos;
                let newYPos = this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.y + (value - this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.x)
                    * Math.sin(this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].rotation.z) / 2;
                    this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.y = newYPos;
                    this.props.cubeArray[this.state.currentFileIndex][interpolationObjIndexCurrentFile].position.y = newYPos;

                    this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["y"] = newYPos;
                    this.props.contents[newFileIndex][interpolationObjIndexNextFile]["y"] = newYPos;
                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.x = value;
                this.props.cubeArray[this.state.currentFileIndex][interpolationObjIndexCurrentFile].scale.x = value;

                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["size"]["width"] = value;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["width"] = value;
                this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
            });
            cubeEndLength.onChange(function (value) {
                let newXPos = this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.x + (value - this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.y) * Math.sin(this.props.cubeArray[newFileIndex][interpolationObjIndexCurrentFile].rotation.z) / 2;
                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.x = newXPos;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["x"] = newXPos;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["x"] = newXPos;
                let newYPos = this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.y - (value - this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.y) * Math.cos(this.props.cubeArray[newFileIndex][interpolationObjIndexCurrentFile].rotation.z) / 2;
                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.y = newYPos;
                // test with -newYPos
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["position"]["y"] = newYPos;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["y"] = newYPos;

                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.y = value;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["size"]["length"] = value;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["length"] = value;
                this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
            });
            cubeEndHeight.onChange(function (value) {
                let newZPos = this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.z + (value - this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.z) / 2;
                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].position.z = newZPos;
                this.props.cubeArray[newFileIndex][interpolationObjIndexNextFile].scale.z = value;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["interpolationEnd"]["size"]["height"] = value;
                this.props.contents[newFileIndex][interpolationObjIndexNextFile]["height"] = value;
                this.update2DBoundingBox(this.state.currentFileIndex, interpolationObjIndexCurrentFile, true);
            });
        }
    }

    let textBoxTrackId = folderBoundingBox3DArray[insertIndex].add(bbox, 'trackId').min(0).step(1).name('Track ID');
    textBoxTrackId.onChange(function (value) {
        // check validity
        // get smallest available track id for this class (look at all objects within that sequence)

        let minTrackId = this.getSmallestTrackId(bbox.class);
        if (value < 1 || value !== minTrackId) {
          this.props.logger.error("You have entered an invalid track ID.");
        }
        this.props.logger.success("Track ID for class " + bbox.class + " was set to " + minTrackId + ".");
        value = Math.round(minTrackId);
        // update cube name
        this.props.cubeArray[this.state.currentFileIndex][insertIndex].name = 'cube-' + bbox.class.charAt(0) + value;
        this.props.contents[this.state.currentFileIndex][insertIndex]["trackId"] = value;
        if (this.props.selectedMesh !== undefined) {
          this.props.selectedMesh.name = 'cube-' + bbox.class.charAt(0) + value;
        }
        $("#bounding-box-3d-menu ul").children().eq(insertIndex + this.state.numGUIOptions).children().first().children().first().children().first().text(bbox.class + " " + value);
    });

    let labelAttributes = {
        'copy_label_to_next_frame': bbox.copyLabelToNextFrame,
        reset: function () {
            this.resetCube(insertIndex);
        },
        delete: function () {
            let labelIndex = this.getObjectIndexByTrackIdAndClass(bbox.trackId, bbox.class, this.state.currentFileIndex);
            this.deleteObject(bbox.class, bbox.trackId, labelIndex);
        }
    };
    let copyLabelToNextFrameCheckbox = folderBoundingBox3DArray[folderBoundingBox3DArray.length - 1].add(labelAttributes, 'copy_label_to_next_frame').name("Copy label to next frame");
    copyLabelToNextFrameCheckbox.domElement.id = 'copy-label-to-next-frame-checkbox-' + insertIndex;
    // check copy checkbox AND disable it for selected object if in interpolation mode
    if (interpolationMode === true && bboxEndParams !== undefined) {
        copyLabelToNextFrameCheckbox.domElement.firstChild.checked = true;
        this.disableCopyLabelToNextFrameCheckbox(copyLabelToNextFrameCheckbox.domElement);

    }
    copyLabelToNextFrameCheckbox.onChange(function (value) {
      this.props.contents[this.state.currentFileIndex][insertIndex]["copyLabelToNextFrame"] = value;
    });

    folderBoundingBox3DArray[folderBoundingBox3DArray.length - 1].add(labelAttributes, 'reset').name("Reset");
    folderBoundingBox3DArray[folderBoundingBox3DArray.length - 1].add(labelAttributes, 'delete').name("Delete");
}

//reset cube parameter and position
resetCube = (index) => {
    let reset_bbox = this.props.contents[this.state.currentFileIndex][index];
    reset_bbox.class = reset_bbox.original.class;
    reset_bbox.x = reset_bbox.original.x;
    reset_bbox.y = reset_bbox.original.y;
    reset_bbox.z = reset_bbox.original.z;
    reset_bbox.rotationY = reset_bbox.original.rotationY;
    reset_bbox.width = reset_bbox.original.width;
    reset_bbox.length = reset_bbox.original.length;
    reset_bbox.height = reset_bbox.original.height;
    this.props.cubeArray[this.state.currentFileIndex][index].position.x = reset_bbox.x;
    this.props.cubeArray[this.state.currentFileIndex][index].position.y = reset_bbox.y;
    this.props.cubeArray[this.state.currentFileIndex][index].position.z = reset_bbox.z;
    this.props.cubeArray[this.state.currentFileIndex][index].rotation.z = reset_bbox.rotationY;
    this.props.cubeArray[this.state.currentFileIndex][index].scale.x = reset_bbox.width;
    this.props.cubeArray[this.state.currentFileIndex][index].scale.y = reset_bbox.length;
    this.props.cubeArray[this.state.currentFileIndex][index].scale.z = reset_bbox.height;
    // TODO: redraw in 3D and 2D to change color

}

//change window size
onWindowResize = () => {
  const headerHeight = this.state.headerHeight;
  const rendererBev = this.state.rendererBev;
  const renderer = this.state.renderer;
  const rendererFrontView = this.state.rendererFrontView;
  const rendererSideView = this.state.rendererSideView;
  const currentCamera =  this.state.currentCamera;

    // update height and top position of helper views
    let imagePanelHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let newHeight = Math.round((window.innerHeight - headerHeight - imagePanelHeight) / 3.0);
    $("#canvasSideView").css("height", newHeight);
    $("#canvasSideView").css("top", headerHeight + imagePanelHeight);
    console.log("window resize: top: " + headerHeight + imagePanelHeight);
    this.initViews.views[1].height = newHeight;
    this.initViews.views[1].top = 0;
    $("#canvasFrontView").css("height", newHeight);
    $("#canvasFrontView").css("top", headerHeight + imagePanelHeight + newHeight);
    this.initViews.views[2].height = newHeight;
    this.initViews.views[2].top = newHeight;
    $("#canvasBev").css("height", newHeight);
    $("#canvasBev").css("top", headerHeight + imagePanelHeight + 2 * newHeight);
    this.initViews.views[3].height = newHeight;
    this.initViews.views[3].top = 2 * newHeight;

    // var canvas3D = $("canvas3d");
    // camera.aspect = canvas3D.getAttribute("width") / canvas3D.getAttribute("height");
    // camera.updateProjectionMatrix();
    // renderer.setSize(canvas3D.getAttribute("width"), canvas3D.getAttribute("height"));
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (rendererBev !== undefined) {
        rendererBev.setSize(window.innerWidth / 3, window.innerHeight / 3);
        rendererFrontView.setSize(window.innerWidth / 3, window.innerHeight / 3);
        rendererSideView.setSize(window.innerWidth / 3, window.innerHeight / 3);
    }
    this.animate();
}

getObjectIndexByName = (objectName) => {
    let idToFind = objectName.split("-")[1];// e.g. cube-V1
    for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
        let uniqueId = this.props.contents[this.state.currentFileIndex][i]["class"].toUpperCase().charAt(0) + this.props.contents[this.state.currentFileIndex][i]["trackId"];
        if (uniqueId === idToFind) {
            return i;
        }
    }
}

updateObjectPosition = () => {
    let objectIndexByTrackId = this.getObjectIndexByName(this.props.selectedMesh.name);
    const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
    const interpolationMode = this.state.interpolationMode;

    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["x"] = this.props.selectedMesh.position.x;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["y"] = this.props.selectedMesh.position.y;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["z"] = this.props.selectedMesh.position.z;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["width"] = this.props.selectedMesh.scale.x;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["length"] = this.props.selectedMesh.scale.y;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["height"] = this.props.selectedMesh.scale.z;
    this.props.contents[this.state.currentFileIndex][objectIndexByTrackId]["rotationY"] = this.props.selectedMesh.rotation.z;
    // update cube array
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["x"] = this.props.selectedMesh.position.x;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["y"] = this.props.selectedMesh.position.y;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["z"] = this.props.selectedMesh.position.z;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["width"] = this.props.selectedMesh.scale.x;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["length"] = this.props.selectedMesh.scale.y;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["height"] = this.props.selectedMesh.scale.z;
    this.props.cubeArray[this.state.currentFileIndex][objectIndexByTrackId]["rotationY"] = this.props.selectedMesh.rotation.z;

    if (interpolationMode === true && this.props.selectedMesh !== undefined) {
        // let selectionIndex = annotationObjects.getSelectionIndex();
        let interpolationStartFileIndex = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"];
        if (interpolationStartFileIndex !== this.state.currentFileIndex) {
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["x"] = this.props.selectedMesh.position.x;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["y"] = this.props.selectedMesh.position.y;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["z"] = this.props.selectedMesh.position.z;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["position"]["rotationY"] = this.props.selectedMesh.rotation.z;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["width"] = this.props.selectedMesh.scale.x;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["length"] = this.props.selectedMesh.scale.y;
          this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationEnd"]["size"]["height"] = this.props.selectedMesh.scale.z;
        }
    }
}

onChangeHandler = (event) => {
    const dragControls = this.state.dragControls;
    const useTransformControls = this.state.useTransformControls;

    useTransformControls = true;
    // update 2d bounding box
    if (dragControls === true) {
        if (this.props.selectedMesh !== undefined) {
            this.updateObjectPosition();
            let objectIndexByTrackId = this.getObjectIndexByName(this.props.selectedMesh.name);
            this.update2DBoundingBox(this.state.currentFileIndex, objectIndexByTrackId, true);
            this.render3d();
        }
    }


    // dragObject = true;
    // change type (e.g. from translate to scale)
    // or a new bounding box object is created
    // or hover over an arrow
    // or dragging starts or draggin ends
    // or mousedown or mouseup
    this.render3d();

    // console.log("change");
    // console.log("mode: "+event.target.getMode());
    // translating works (no object is created), problem: selection randomly works
    // scaleRotateTranslate = true;
    // selection works (clicking on background, current object will be unselected), problem: after translation an object is created
    // scaleRotateTranslate = !scaleRotateTranslate;
    // update bounding box in image
    // console.log(event);
}

onDraggingChangedHandler = (event) => {
  // const useTransformControls = this.state.useTransformControls;

  this.setState({
    useTransformControls: true
  })
    // useTransformControls = true;

    const transformControls = this.state.transformControls;

    const dragControls = this.state.dragControls;

    dragControls = true;
    // update 2d bounding box
    if (this.props.selectedMesh !== undefined) {
        this.updateObjectPosition();
        let objectIndexByTrackId = this.getObjectIndexByName(this.props.selectedMesh.name);
        this.update2DBoundingBox(this.state.currentFileIndex, objectIndexByTrackId, true);
        this.render3d();
    }
    // dragObject = false;
    // executed after drag finished
    // TODO: scale only on one side
    if (transformControls.getMode() === "scale") {
        // labelTool.selectedMesh.translateY(labelTool.selectedMesh.geometry.parameters.height / 2)
    }
}

addTransformControls = () => {
  const scene = this.state.scene;
  const renderer = this.state.renderer;
  const currentCamera = this.state.currentCamera;

  const transformControls = this.state.transformControls;


    if (transformControls === undefined) {
        transformControls = new TransformControls(currentCamera, renderer.domElement);
        transformControls.name = "transformControls";
    } else {
        if (transformControls.object !== this.props.selectedMesh) {
            transformControls.detach();
        } else {
            // transform controls are already defined and attached to selected object
            return;
        }
    }
    transformControls.removeEventListener('change', this.onChangeHandler);
    transformControls.addEventListener('change', this.onChangeHandler);
    transformControls.removeEventListener('dragging-changed', this.onDraggingChangedHandler);
    transformControls.addEventListener('dragging-changed', this.onDraggingChangedHandler);
    transformControls.attach(this.props.selectedMesh);
    this.props.removeObject("transformControls");
    scene.add(transformControls);
    window.removeEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    window.addEventListener('keyup', this.keyUpHandler);
}

keyUpHandler = (event) => {
  const transformControls = this.state.transformControls;
    switch (event.keyCode) {
        case 17: // Ctrl
            transformControls.setTranslationSnap(null);
            transformControls.setRotationSnap(null);
            break;
    }
}

keyDownHandler = (event) => {
  const transformControls = this.state.transformControls;
  const interpolationMode = this.state.interpolationMode;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;

    if (this.props.selectedMesh !== undefined) {
        switch (event.keyCode) {
            case 17: // Ctrl
                transformControls.setTranslationSnap(0.5);
                if (transformControls.getMode() === "rotate") {
                    let newRotation = Math.ceil(this.props.selectedMesh.rotation.z / THREE.Math.degToRad(15));
                    let lowerBound = newRotation * 15;
                    if (this.props.selectedMesh.rotation.z - lowerBound < THREE.Math.degToRad(15) / 2) {
                        // rotate to lower bound`
                        this.props.selectedMesh.rotation.z = lowerBound;
                    } else {
                        // rotate to upper bound
                        this.props.selectedMesh.rotation.z = lowerBound + THREE.Math.degToRad(15);
                    }
                }

                transformControls.setRotationSnap(THREE.Math.degToRad(15));
                break;
            case 73: //I
                if (this.props.getSelectionIndex() !== -1) {
                    if (interpolationMode === true) {
                        if (this.props.contents[this.state.currentFileIndex][this.props.getSelectionIndex()]["interpolationStartFileIndex"] !== this.state.currentFileIndex) {
                            this.interpolate();
                        } else {
                          this.props.logger.message("Please choose end frame.");
                        }
                    } else {
                      this.props.logger.message("Please activate interpolation mode first.");
                    }
                } else {
                  this.props.logger.message("Please select an object first.");
                }
            case 82: // R
                transformControls.setMode("rotate");
                transformControls.showX = false;
                transformControls.showY = false;
                transformControls.showZ = true;
                // enable gizmo
                transformControls.children[0].enabled = true;
                // disable planes (translation, scaling)
                transformControls.children[1].enabled = false;
                break;
            case 83: // S
                transformControls.setMode("scale");
                transformControls.showX = true;
                transformControls.showY = true;
                if (birdsEyeViewFlag === true) {
                    transformControls.showZ = true;
                } else {
                    transformControls.showZ = false;
                }
                // enable planes (translation, scaling)
                transformControls.children[1].enabled = false;
                break;
            case 84: // T
                transformControls.setMode("translate");
                transformControls.showX = true;
                transformControls.showY = true;
                if (birdsEyeViewFlag === true) {
                    transformControls.showZ = true;
                } else {
                    transformControls.showZ = false;
                }
                // enable planes (translation, scaling)
                transformControls.children[1].enabled = false;
                break;
            case 88: // X
                transformControls.showX = !transformControls.showX;
                break;
            case 89: // Y
                transformControls.showY = !transformControls.showY;
                break;
            case 90: // Z
                // only allow to switch z axis in 3d view
                if (birdsEyeViewFlag === false) {
                    transformControls.showZ = !transformControls.showZ;
                } else {
                  this.props.logger.message("Show/Hide z-axis only in 3D view possible.");
                }
                break;
            case 187:
            case 107: // +, =, num+
                transformControls.setSize(Math.min(transformControls.size + 0.1, 10));
                break;
            case 189:
            case 109: // -, _, num-
                transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
                break;
        }
    }

    switch (event.keyCode) {
        case 67: // C
            this.switchView();
            break;
        case 75: //K
        this.toggleKeyboardNavigation();
            break;
        case 32: // Spacebar
            // play video sequence from current frame on to end
            this.props.playSequence = !this.props.playSequence;
            if (this.props.playSequence === true) {
              this.initPlayTimer();
            }
            break;
        case 78:// N
            // next frame
            this.props.nextFrame();
            break;
        case 80:// P
            // previous frame
            this.props.previousFrame();
            break;
    }


}

setOrbitControls = () =>{
  const scene = this.state.scene;
  const renderer = this.state.renderer;
  const pointerLockObject = this.state.pointerLockObject;

    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    scene.remove(pointerLockObject);


    const currentCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    currentCamera.position.set(0, 0, 5);
    currentCamera.up.set(0, 0, 1);

  
    const currentOrbitControls = new TrackballControls(currentCamera, renderer.domElement);

    this.setState({
      currentCamera: currentCamera,
      currentOrbitControls: currentOrbitControls
    })

    currentOrbitControls.enablePan = true;
    currentOrbitControls.enableRotate = true;
    currentOrbitControls.autoRotate = false;// true for demo
    currentOrbitControls.enableKeys = false;
    currentOrbitControls.maxPolarAngle = Math.PI / 2;
}

onKeyDown = (event) => {
    switch (event.keyCode) {
        case 38: // up
            this.setState({
              rotateUp: true
            })
            break;
        case 69: //E
            this.setState({
              moveUp: true
            })
            break;
        case 81: //Q
            this.setState({
              moveDown: true
            }) 
            break;
        case 87: // w
            this.setState({
              moveForward: true
            })    
            break;
        case 37: // left
            this.setState({
              rotateLeft: true
            })
            break;
        case 65: // a
            this.setState({
              moveLeft: true
            })
            break;
        case 40: // down
            this.setState({
              rotateDown: true
            }) 
            break;
        case 83: // s
            this.setState({
              moveBackward: true
            }) 
            break;
        case 39: // right
            this.setState({
              rotateRight: true
            }) 
            break;
        case 68: // d
            this.setState({
              moveRight: true
            })
            break;
    }
}

onKeyUp = (event) => {
    switch (event.keyCode) {
        case 38: // up
            this.setState({
              rotateUp: true
            })
      
            break;
        case 69: // E
            this.setState({
              moveUp: true
            })

            break;
        case 81: //Q
            this.setState({
              moveDown: true
            })
       
            break;
        case 87: // w
            this.setState({
              moveForward: true
            })
      
            break;
        case 37: // left
            this.setState({
              rotateLeft: true
            })
         
            break;
        case 65: // a
            this.setState({
              moveLeft: true
            })
       
            break;
        case 40: // down
            this.setState({
              rotateDown: true
            })
      
            break;
        case 83: // s
            this.setState({
              moveBackward: true
            })
     
            break;
        case 39: // right
            this.setState({
              rotateRight: true
            })

            break;
        case 68: // d
            this.setState({
              moveRight: true
            })

            break;
    }
}

setPointerLockControls = () => {
  const scene = this.state.scene;
  const canvas3D = this.state.canvas3D;
  const currentCamera = this.state.currentCamera;

  const pointerLockControls = new TrackballControls(currentCamera, canvas3D);
  const pointerLockObject = pointerLockControls.getObject();

  this.setState({
    pointerLockControls: pointerLockControls,
    pointerLockObject: pointerLockObject
  })
    // pointerLockControls = new THREE.PointerLockControls(currentCamera, canvas3D);
    
    pointerLockObject.position.set(0, 0, 0);
    pointerLockObject.rotation.set(Math.PI / 2, 0, 0);
    scene.add(pointerLockObject);
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
}

//set camera type
setCamera = () => {
  const transformControls = this.state.transformControls;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;
  const renderer = this.state.renderer;
  const canvas3D = this.state.canvas3D;
  const keyboardNavigation = this.state.keyboardNavigation;
  const currentCamera = this.state.currentCamera;
  const currentOrbitControls = this.state.currentOrbitControls;

  // const pointerLockControls = this.state.pointerLockControls;

    if (birdsEyeViewFlag === false) {
        // 3D mode (perspective mode)
        currentCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
        // currentCamera = perspectiveCamera;
        if (transformControls !== undefined) {
            if (this.props.selectedMesh !== undefined) {
                this.addTransformControls();
                // if in birdseyeview then find minimum of longitude and latitude
                // otherwise find minimum of x, y and z
                // let smallestSide;
                // if (birdsEyeViewFlag === true) {
                //     smallestSide = Math.min(labelTool.selectedMesh.scale.x, labelTool.selectedMesh.scale.y);
                // } else {
                //     smallestSide = Math.min(Math.min(labelTool.selectedMesh.scale.x, labelTool.selectedMesh.scale.y), labelTool.selectedMesh.scale.z);
                // }
                transformControls.size = 2;
                transformControls.showZ = true;
            } else {
              this.props.removeObject("transformControls");
            }
        }

        currentCamera.position.set(0, 0, 5);
        currentCamera.up.set(0, 0, 1);

        canvas3D.removeEventListener('keydown', this.canvas3DKeyDownHandler);
        canvas3D.addEventListener('keydown', this.canvas3DKeyDownHandler);

        // 아직까진 keyboard 조작이 필요없어 임시 주석 처리함
        // if (keyboardNavigation === true) {
        //     this.setPointerLockControls();
        // } else {
        //     this.setOrbitControls();
        // }

        // TODO: enable to fly through the 3d scene using keys
        // let onKeyDown = function (event) {
        //
        //     switch (event.keyCode) {
        //
        //         case 87: // w
        //             moveForward = true;
        //             break;
        //
        //         case 65: // a
        //             moveLeft = true;
        //             break;
        //
        //         case 83: // s
        //             moveBackward = true;
        //             break;
        //
        //         case 68: // d
        //             moveRight = true;
        //             break;
        //     }
        //
        // };
        //
        // let onKeyUp = function (event) {
        //
        //     switch (event.keyCode) {
        //
        //         case 87: // w
        //             moveForward = false;
        //             break;
        //
        //         case 65: // a
        //             moveLeft = false;
        //             break;
        //
        //         case 83: // s
        //             moveBackward = false;
        //             break;
        //
        //         case 68: // d
        //             moveRight = false;
        //             break;
        //
        //     }
        //
        // };
        //
        // document.removeEventListener('keydown', onKeyDown);
        // document.addEventListener('keydown', onKeyDown, false);
        // document.removeEventListener('keyup', onKeyUp);
        // document.addEventListener('keyup', onKeyUp, false);

        // let pos = labelTool.camChannels[0].position;
        // controls.object.position.set(-pos[1], pos[0] - labelTool.positionLidarNuscenes[0], labelTool.positionLidarNuscenes[2] - pos[2]);
        // controls.target = new THREE.Vector3(-pos[1] - 0.0000001, pos[0] - labelTool.positionLidarNuscenes[0] + 0.0000001, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward

        // orbitControls.update();
        // currentOrbitControls.removeEventListener('change', render);
        // currentOrbitControls.addEventListener('change', render);
    } else {
        // BEV
        console.log("transformControls",transformControls);
        if (transformControls !== undefined) {
            transformControls.showZ = false;
        }

        const currentCamera = new THREE.OrthographicCamera(-40, 40, 20, -20, 0.0001, 2000);
        // currentCamera = orthographicCamera;
        console.log("currentCamera",currentCamera);
        currentCamera.position.set(0, 0, 5);
        currentCamera.up.set(0, 0, 1);

        // const currentOrbitControls = new THREE.OrbitControls(currentCamera, renderer.domElement);
        currentOrbitControls.enablePan = true;
        currentOrbitControls.enableRotate = false;
        currentOrbitControls.autoRotate = false;
        currentOrbitControls.enableKeys = false;
        currentOrbitControls.maxPolarAngle = Math.PI / 2;

        // orbitControls = new THREE.OrbitControls(currentCamera, renderer.domElement);
        // currentOrbitControls = orthographicOrbitControls;
        // currentOrbitControls.object.position.set(0, 0, 100);
        // currentOrbitControls.object.rotation.set(0, THREE.Math.degToRad(90), 0);
        // controls.rotateSpeed = 2.0;
        // controls.zoomSpeed = 0.3;
        // controls.panSpeed = 0.2;
        // controls.enableZoom = true;
        // controls.enablePan = true;
        // orbitControls.enableRotate = false;


        // controls.enableDamping = false;
        // controls.dampingFactor = 0.3;
        // controls.minDistance = 0.3;
        // controls.maxDistance = 0.3 * 100;
        // controls.noKey = true;
        // controls.autoForward = true;
        // controls.movementSpeed = 1000;
        // controls.rollSpeed = Math.PI / 24;
        // controls.enabled = true;
        // controls.target.set(0, 0, 0);
        // controls.autoRotate = true;
        // orbitControls.update();
    }
    // scene.add(camera);
    // currentOrbitControls.addEventListener('change', render);
    if (keyboardNavigation === false) {
      currentOrbitControls.update();
    }

}

render3d = () => {
  const renderer = this.state.renderer;
    // renderer.clear();
    // renderer.clearColor(22, 22, 22);
    // renderer.setClearColor(new THREE.Color(22 / 256.0, 22 / 256.0, 22 / 256.0));
    // render main window
    const scene = this.state.scene;
    const currentOrbitControls = new TrackballControls(currentCamera, renderer.domElement);
    const currentCamera = this.state.currentCamera;

    const keyboardNavigation = this.state.keyboardNavigation;
    let mainView = this.initViews.views[0];
    renderer.setViewport(mainView.left, mainView.top, mainView.width, mainView.height);
    renderer.setScissor(mainView.left, mainView.top, mainView.width, mainView.height);
    renderer.setScissorTest(true);
    renderer.setClearColor(mainView.background);

    currentCamera.aspect = mainView.width / mainView.height;
    currentCamera.updateProjectionMatrix();
    renderer.render(scene, currentCamera);

    // renderer.clear();
    if (this.props.selectedMesh !== undefined) {
        for (let i = 1; i < this.initViews.views.length; i++) {
            let view = this.initViews.views[i];
            let camera = view.camera;
            view.updateCamera(camera, scene, this.props.selectedMesh.position);
            renderer.setViewport(view.left, view.top, view.width, view.height);
            renderer.setScissor(view.left, view.top, view.width, view.height);
            renderer.setScissorTest(true);
            renderer.setClearColor(view.background);
            camera.aspect = view.width / view.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        }
    }

    if (this.props.cubeArray !== undefined && this.props.cubeArray.length > 0 && this.props.cubeArray[this.state.currentFileIndex] !== undefined && this.props.cubeArray[this.state.currentFileIndex].length > 0
        && this.props.spriteArray !== undefined && this.props.spriteArray.length > 0 && this.props.spriteArray[this.state.currentFileIndex] !== undefined && this.props.spriteArray[this.state.currentFileIndex].length > 0) {
        this.updateAnnotationOpacity();
        this.updateScreenPosition();
    }
    if (keyboardNavigation === false) {
        currentOrbitControls.update();
    }
}

updateAnnotationOpacity = () => {
  const currentCamera = this.state.currentCamera;


    for (let i = 0; i < this.props.cubeArray[this.state.currentFileIndex].length; i++) {
        let obj = this.props.cubeArray[this.state.currentFileIndex][i];
        let sprite = this.props.spriteArray[this.state.currentFileIndex][i];
        let meshDistance = currentCamera.position.distanceTo(obj.position);
        let spriteDistance = currentCamera.position.distanceTo(sprite.position);
        const spriteBehindObject = spriteDistance > meshDistance;
        this.setState({
          spriteBehindObject: spriteBehindObject
        })
        sprite.material.opacity = spriteBehindObject ? 0.2 : 0.8;

        // if number should change size according to its position
        // then comment out the following line and the ::before pseudo-element
        sprite.material.opacity = 0;
    }

}

updateScreenPosition = () => {
  const headerHeight = this.state.headerHeight;
  const currentCamera = this.state.currentCamera;
  const spriteBehindObject = this.state.spriteBehindObject;
  const renderer = this.state.renderer;

    for (let i = 0; i < this.props.cubeArray[this.state.currentFileIndex].length; i++) {
        let cubeObj = this.props.cubeArray[this.state.currentFileIndex][i];
        let annotationObj = this.props.contents[this.state.currentFileIndex][i];
        const vector = new THREE.Vector3(cubeObj.position.x, cubeObj.position.y, cubeObj.position.z + cubeObj.scale.z / 2);
        const canvas = renderer.domElement;
        vector.project(currentCamera);
        vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width));
        vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height));
        if (annotationObj.trackId !== undefined) {
            let classTooltip = $("#tooltip-" + annotationObj.class.charAt(0) + annotationObj.trackId)[0];
            if (classTooltip !== undefined) {
                let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
                classTooltip.style.top = `${vector.y + headerHeight + imagePaneHeight - 21}px`;
                classTooltip.style.left = `${vector.x}px`;
                classTooltip.style.opacity = spriteBehindObject ? 0.25 : 1;
            }
        }
    }
}

update = () => {
  const renderer = this.state.renderer;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;
  const currentCamera = this.state.currentCamera;
  const mousePos = this.state.mousePos;
  const scene = this.state.scene;
  const keyboard = this.state.keyboard;
  const clock = this.state.clock;

  const currentOrbitControls = new TrackballControls(currentCamera, renderer.domElement);
    // disable rotation of orbit controls if object selected
    if (birdsEyeViewFlag === false) {
        if (this.props.selectedMesh !== undefined) {
            currentOrbitControls.enableRotate = false;
        } else {
            currentOrbitControls.enableRotate = true;
        }
    }

    // rescale transform controls
    // if (labelTool.selectedMesh !== undefined && birdsEyeViewFlag === true) {
    //     let newSize = labelTool.selectedMesh.position.distanceTo(currentCamera.position) / 6;
    //     console.log(newSize);
    //     transformControls.size = newSize;
    // } else {
    //     // dis
    // }


    // find intersections
    // create a Ray with origin at the mouse position
    // and direction into the scene (camera direction)
    let vector = new THREE.Vector3(mousePos.x, mousePos.y, 1);
    const intersectedObject = this.state.intersectedObject;
    // console.log(vector.x + " " + vector.y);
    vector.unproject(currentCamera);
    let ray = new THREE.Raycaster(currentCamera.position, vector.sub(currentCamera.position).normalize());
    // create an array containing all objects in the scene with which the ray intersects
    // filter objects
    // let cubeList = [];
    // for (let objIdx in scene.children) {
    //     if (scene.children.hasOwnProperty(objIdx)) {
    //         let obj = scene.children[objIdx];
    //         if (obj.name.startsWith("cube")) {
    //             cubeList.push(obj);
    //         }
    //     }
    //
    // }
    //let intersects = ray.intersectObjects(cubeList);
    let intersects = ray.intersectObjects(scene.children);
    // intersectedObject = the object in the scene currently closest to the camera
    //		and intersected by the Ray projected from the mouse position

    // if there is one (or more) intersections
    if (intersects.length > 0) {
        // console.log("intersection");
        // if the closest object intersected is not the currently stored intersection object
        if (intersects[0].object !== intersectedObject && intersects[0].object.name.startsWith("cube")) {
            // restore previous intersection object (if it exists) to its original color
            if (intersectedObject) {
                intersectedObject.material.color.setHex(intersectedObject.currentHex);
            }
            // store reference to closest object as current intersection object
            intersectedObject = intersects[0].object;
            // store color of closest object (for later restoration)
            intersectedObject.currentHex = intersectedObject.material.color.getHex();
            // set a new color for closest object
            // intersectedObject.material.color.setHex(0xff0000);
        }
    } else {
        // there are no intersections
        // restore previous intersection object (if it exists) to its original color
        if (intersectedObject) {
            intersectedObject.material.color.setHex(intersectedObject.currentHex);
        }
        // remove previous intersection object reference
        //  by setting current intersection object to "nothing"
        intersectedObject = null;
    }

    keyboard.update();
    let moveDistance = 50 * clock.getDelta();
    // if (keyboardNavigation === true) {
    //     if (keyboard.down("A")) {
    //         // A MOVE LEFT
    //         currentCamera.position.x = currentCamera.position.x - moveDistance;
    //     }
    //     if (keyboard.down("W")) {
    //         // W MOVE FORWARD
    //         currentCamera.position.y = currentCamera.position.y + moveDistance;
    //     }
    //     if (keyboard.down("D")) {
    //         // D MOVE RIGHT
    //         currentCamera.position.x = currentCamera.position.x + moveDistance;
    //     }
    //     if (keyboard.down("S")) {
    //         // S MOVE BACKWARD
    //         currentCamera.position.y = currentCamera.position.y - moveDistance;
    //     }
    //     if (keyboard.down("left")) {
    //         // LEFT ROTATION (YAW)
    //         currentCamera.rotation.y = currentCamera.rotation.y - moveDistance;
    //     }
    //     if (keyboard.down("up")) {
    //         // UP ROTATION (PITCH)
    //         currentCamera.rotation.x = currentCamera.rotation.x + moveDistance;
    //     }
    //     if (keyboard.down("right")) {
    //         // RIGHT ROTATION (YAW)
    //         currentCamera.rotation.y = currentCamera.rotation.y + moveDistance;
    //     }
    //     if (keyboard.down("down")) {
    //         // DOWN ROTATION (PITCH)
    //         currentCamera.rotation.x = currentCamera.rotation.x - moveDistance;
    //     }
    //     currentCamera.updateProjectionMatrix();
    // }
}

//draw animation
animate = () => {
    requestAnimationFrame(this.animate);

    // var delta = clock.getDelta();
    // controls.update(delta);
    // keyboard.update();
    // if (keyboard.down("shift")) {
    //     controls.enabled = true;
    //     bboxFlag = false;
    // }
    //
    // if (keyboard.up("shift")) {
    //     controls.enabled = false;
    //     bboxFlag = true;
    // }

    // if (keyboard.down("alt")) {
    //     moveFlag = true;
    // }
    // if (keyboard.up("alt")) {
    //     moveFlag = false;
    // }
    // if (keyboard.down("C")) {
    //     rFlag = false;
    //     if (cFlag === false) {
    //         copyBboxIndex = annotationObjects.getSelectionIndex();
    //         copyBbox = annotationObjects.contents[this.state.currentFileIndex][copyBboxIndex];
    //         cFlag = true;
    //     } else {
    //         copyBboxIndex = -1;
    //         cFlag = false;
    //     }
    // }
    // if (keyboard.down("R")) {
    //     cFlag = false;
    //     if (rFlag === false) {
    //         rotationBboxIndex = annotationObjects.getSelectionIndex();
    //         rFlag = true;
    //     }
    //     else {
    //         rotationBboxIndex = -1;
    //         rFlag = false;
    //     }
    // }

    // required if autoupdate
    // currentOrbitControls.update();

    // stats.update();
    // if (annotationObjects.getSelectionIndex() !== rotationBboxIndex) {
    //     rFlag = false;
    // }
    // var cubeLength;
    // var cubes = labelTool.cubeArray[this.state.currentFileIndex];
    // if (cubes == undefined) {
    //     cubeLength = 0;
    // } else {
    //     cubeLength = cubes.length;
    // }

    // for (var i = 0; i < labelTool.cubeArray[this.state.currentFileIndex].length; i++) {
    //     if (labelTool.bboxIndexArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex][i] == annotationObjects.getSelectionIndex()) {
    //         folderBoundingBox3DArray[i].open();
    //         folderPositionArray[i].open();
    //         folderSizeArray[i].open();
    //     }
    //     else {
    //         folderBoundingBox3DArray[i].close();
    //     }
    //     if (i == labelTool.bboxIndexArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex].lastIndexOf(copyBboxIndex.toString()) && cFlag == true) {
    //         labelTool.cubeArray[this.state.currentFileIndex][i].material.color.setHex(0xffff00);
    //     }
    //     else if (folderBoundingBox3DArray[i].closed == false) {
    //         if (i == labelTool.bboxIndexArray[this.state.currentFileIndex][this.state.currentCameraChannelIndex].lastIndexOf(rotationBboxIndex.toString()) && rFlag == true) {
    //             labelTool.cubeArray[this.state.currentFileIndex][i].material.color.setHex(0xff8000);
    //         }
    //         else {
    //             labelTool.cubeArray[this.state.currentFileIndex][i].material.color.setHex(0xff0000);
    //             folderPositionArray[i].open();
    //             folderSizeArray[i].open();
    //         }
    //     }
    //
    //     else if (folderBoundingBox3DArray[i].closed == true) {
    //         labelTool.cubeArray[this.state.currentFileIndex][i].material.color.setHex(0x008866);
    //     }
    // }
    // cameraControls.update(camera, keyboard, clock);
    const translationVelocity = this.state.translationVelocity;
    const rotationVelocity = this.state.rotationVelocity;
    const translationDirection = this.state.translationDirection;
    const rotationDirection = this.state.rotationDirection;
    const pointerLockControls = this.state.pointerLockControls;
    const keyboardNavigation = this.state.keyboardNavigation;
    const pointerLockObject = this.state.pointerLockObject;
    const prevTime = this.state.prevTime;

    this.update();
    if (keyboardNavigation === true && pointerLockControls !== undefined) {
        let time = performance.now();
        let delta = (time - prevTime) / 1000;
        translationVelocity.x -= translationVelocity.x * 10.0 * delta;
        translationVelocity.z -= translationVelocity.z * 10.0 * delta;
        translationVelocity.y -= translationVelocity.y * 10.0 * delta;
        rotationVelocity.x -= rotationVelocity.x * delta * 0.000000001;
        rotationVelocity.z -= rotationVelocity.z * delta * 0.000000001;
        rotationVelocity.y -= rotationVelocity.y * delta * 0.000000001;

        translationDirection.x = Number(this.state.moveLeft) - Number(this.state.moveRight);
        translationDirection.y = Number(this.state.moveForward) - Number(this.state.moveBackward);
        translationDirection.z = Number(this.state.moveUp) - Number(this.state.moveDown);
        translationDirection.normalize(); // this ensures consistent movements in all directions
        rotationDirection.x = Number(this.state.rotateUp) - Number(this.state.rotateDown);
        rotationDirection.y = Number(this.state.rotateRight) - Number(this.state.rotateLeft);
        rotationDirection.z = 0; // roll not used
        rotationDirection.normalize(); // this ensures consistent movements in all directions

        if (this.state.moveForward || this.state.moveBackward) translationVelocity.z -= translationDirection.y * 400.0 * delta;
        if (this.state.moveLeft || this.state.moveRight) translationVelocity.x -= translationDirection.x * 400.0 * delta;
        if (this.state.moveUp || this.state.moveDown) translationVelocity.y += translationDirection.z * 400.0 * delta;
        if (this.state.rotateUp || this.state.rotateDown) rotationVelocity.x += rotationDirection.x * delta;
        if (this.state.rotateRight || this.state.rotateLeft) rotationVelocity.y -= rotationDirection.y * delta;

        pointerLockControls.getObject().translateX(translationVelocity.x * delta);//lateral
        pointerLockControls.getObject().translateY(translationVelocity.y * delta);//vertical
        pointerLockControls.getObject().translateZ(translationVelocity.z * delta);//longitudinal

        // pointerLockControls.getObject().rotateX(rotationVelocity.x * delta);//pitch
        // pointerLockControls.getObject().rotateY(rotationVelocity.y * delta);//yaw
        //pointerLockControls.getObject().rotateZ(rotationVelocity.z * delta);//roll not used


        // TODO: do not allow to rotate up/down (pitch) because yaw will not work afterwards (because yaw rotation around local vertical axis)
        // solution: yaw rotation around vertical WORLD axis!
        // if (rotateUp) {
        //     pointerLockObject.rotateX(0.01);//pitch
        // } else {
        //     pointerLockObject.rotateX(0);//pitch
        // }
        // if (rotateDown) {
        //     pointerLockObject.rotateX(-0.01);//pitch
        // } else {
        //     pointerLockObject.rotateX(0);//pitch
        // }

        if (this.state.rotateLeft) {
            pointerLockObject.rotateY(0.01);//pitch
        } else {
            pointerLockObject.rotateY(0);//pitch
        }
        if (this.state.rotateRight) {
            pointerLockObject.rotateY(-0.01);//pitch
        } else {
            pointerLockObject.rotateY(0);//pitch
        }

        prevTime = time;
    }

    this.render3d();

}


/**
 * Find the corresponding camera channels in that the 3D object is visible.
 * Note that an object can be visible in one or two camera channels
 * @param x Lateral position
 * @param y Longitudinal position
 * @returns channel One of the six camera channels
 */
getChannelsByPosition = (x, y) => {
    let channels = [];
    let alphaRadian;
    if (x >= 0 && y >= 0) {
        alphaRadian = Math.atan(Math.abs(y) / Math.abs(x)) + Math.PI / 2;
    } else if (x < 0 && y >= 0) {
        alphaRadian = Math.atan(Math.abs(x) / Math.abs(y)) + Math.PI;
    } else if (x < 0 && y < 0) {
        alphaRadian = Math.atan(Math.abs(y) / Math.abs(x)) + 1.5 * Math.PI;
    } else {
        // x>=0 and y<0
        alphaRadian = Math.atan(Math.abs(x) / Math.abs(y));
    }
    let alphaDegrees = 360 * alphaRadian / (2 * Math.PI);

    if (this.state.currentDataset === this.state.datasets.NuScenes) {
        if ((alphaDegrees >= 325 && alphaDegrees < 360) || (alphaDegrees >= 0 && alphaDegrees < 35)) {
            channels.push(this.props.camChannels[1].channel);
        }
        if (alphaDegrees >= 20 && alphaDegrees < 90) {
            channels.push(this.props.camChannels[2].channel);
        }
        if (alphaDegrees >= 75 && alphaDegrees < 145) {
            channels.push(this.props.camChannels[3].channel);
        }
        if (alphaDegrees >= 115 && alphaDegrees < 245) {
            channels.push(this.props.camChannels[4].channel);
        }
        if (alphaDegrees >= 215 && alphaDegrees < 285) {
            channels.push(this.props.camChannels[5].channel);
        }
        if (alphaDegrees >= 270 && alphaDegrees < 340) {
            channels.push(this.props.camChannels[0].channel);
        }
    } else {
        // GoPro Hero 4 Black, 4:3, wide angle, 122.6 degree
        if ((alphaDegrees >= 312.8 && alphaDegrees < 360) || (alphaDegrees >= 0 && alphaDegrees < 47.2)) {
            channels.push(this.props.camChannels[1].channel);
        }
        if (alphaDegrees >= 20 && alphaDegrees < 90) {
            channels.push(this.props.camChannels[2].channel);
        }
        if (alphaDegrees >= 75 && alphaDegrees < 145) {
            channels.push(this.props.camChannels[3].channel);
        }
        if (alphaDegrees >= 115 && alphaDegrees < 245) {
            channels.push(this.props.camChannels[4].channel);
        }
        if (alphaDegrees >= 215 && alphaDegrees < 285) {
            channels.push(this.props.camChannels[5].channel);
        }
        if (alphaDegrees >= 270 && alphaDegrees < 340) {
            channels.push(this.props.camChannels[0].channel);
        }
    }

    return channels;
}

rotatePoint = (pointX, pointY, originX, originY, angle) => {
    angle = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
        y: Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
    };
}


calculateProjectedBoundingBox = (xPos, yPos, zPos, width, length, height, channel, rotationY) => {
    let idx = this.props.getChannelIndexByName(channel);
    // TODO: calculate scaling factor dynamically (based on top position of slider)
    let imageScalingFactor;
    let imagePanelHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    console.log("image panel height: "+imagePanelHeight)
    if (this.state.currentDataset === this.state.datasets.NuScenes) {
        imageScalingFactor = 900 / imagePanelHeight;//5
        xPos = xPos + this.props.translationVectorLidarToCamFront[1];//lat
        yPos = yPos + this.props.translationVectorLidarToCamFront[0];//long
        zPos = zPos + this.props.translationVectorLidarToCamFront[2];//vertical
    }
    let cornerPoints = [];

    if (this.state.currentDataset === this.state.datasets.NuScenes) {
        cornerPoints.push(new THREE.Vector3(xPos - width / 2, yPos - length / 2, zPos + height / 2));
        cornerPoints.push(new THREE.Vector3(xPos + width / 2, yPos - length / 2, zPos + height / 2));
        cornerPoints.push(new THREE.Vector3(xPos + width / 2, yPos + length / 2, zPos + height / 2));
        cornerPoints.push(new THREE.Vector3(xPos - width / 2, yPos + length / 2, zPos + height / 2));
        cornerPoints.push(new THREE.Vector3(xPos - width / 2, yPos - length / 2, zPos - height / 2));
        cornerPoints.push(new THREE.Vector3(xPos + width / 2, yPos - length / 2, zPos - height / 2));
        cornerPoints.push(new THREE.Vector3(xPos + width / 2, yPos + length / 2, zPos - height / 2));
        cornerPoints.push(new THREE.Vector3(xPos - width / 2, yPos + length / 2, zPos - height / 2));
    }


    let projectedPoints = [];
    for (let cornerPoint in cornerPoints) {
        let point = cornerPoints[cornerPoint];
        let point3D = [point.x, point.y, point.z, 1];
        let projectionMatrix;
        let point2D;
        if (this.state.currentDataset === this.state.datasets.NuScenes) {
            projectionMatrix = this.props.camChannels[idx].projectionMatrixNuScenes;
            point2D = this.props.matrixProduct3x4(projectionMatrix, point3D);
        }

        if (point2D[2] > 0) {
            // add only points that are in front of camera
            let windowX = point2D[0] / point2D[2];
            let windowY = point2D[1] / point2D[2];
            projectedPoints.push(new THREE.Vector2(windowX / imageScalingFactor, windowY / imageScalingFactor));
        } else {
            // do not draw bounding box if it is too close too camera or behind
            return [];
        }

    }
    return projectedPoints;
}

// function setCameraToChannel(channel) {
//     let channelIdx = getChannelIndexByName(channel);
//     let fieldOfView = labelTool.camChannels[channelIdx].fieldOfView;
//     // scene.remove(camera);
//     camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 0.01, 100000);
//     camera.up = new THREE.Vector3(0, 0, 1);
//     // scene.add(camera);
//     controls = new THREE.OrbitControls(camera, renderer.domElement);
//     controls.enableRotate = false;
//     controls.enablePan = true;
//     if (channel === labelTool.camChannels[0].channel) {
//         // front left
//         let pos = labelTool.camChannels[0].position;
//         controls.object.position.set(-pos[1], pos[0] - labelTool.positionLidarNuscenes[0], labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(-pos[1] + 0.0000001, pos[0] - labelTool.positionLidarNuscenes[0] + 0.0000001, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward
//     } else if (channel === labelTool.camChannels[1].channel) {
//         // front
//         let pos = labelTool.camChannels[1].position;
//         controls.object.position.set(pos[1], pos[0], labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(pos[1], pos[0] + 0.0000001, labelTool.positionLidarNuscenes[2] - pos[2]);
//     } else if (channel === labelTool.camChannels[2].channel) {
//         // front right
//         let yPos = 0.5;
//         let xPos = Math.tan(55 * Math.PI / 180) * yPos;
//         let pos = labelTool.camChannels[2].position;
//         controls.object.position.set(-pos[1] + xPos, pos[0] - labelTool.positionLidarNuscenes[0] + yPos, labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(-pos[1] + xPos + 0.0000001, pos[0] - labelTool.positionLidarNuscenes[0] + yPos + 0.0000001, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward
//     } else if (channel === labelTool.camChannels[3].channel) {
//         // back right
//         let yPos = 0.5;
//         let xPos = Math.tan(110 * Math.PI / 180) * yPos;
//         let pos = labelTool.camChannels[3].position;
//         controls.object.position.set(-pos[1] - xPos, pos[0] - labelTool.positionLidarNuscenes[0] - yPos, labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(-pos[1] - xPos + 0.0000001, pos[0] - labelTool.positionLidarNuscenes[0] - yPos - 0.0000001, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward
//     } else if (channel === labelTool.camChannels[4].channel) {
//         // back
//         let yPos = 0.5;
//         let xPos = Math.tan(180 * Math.PI / 180) * yPos;
//         let pos = labelTool.camChannels[4].position;
//         controls.object.position.set(-pos[1] - xPos, pos[0] - labelTool.positionLidarNuscenes[0] - yPos, labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(-pos[1] - xPos - 0.0000001, pos[0] - labelTool.positionLidarNuscenes[0] - yPos - 0.01, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward
//     } else if (channel === labelTool.camChannels[5].channel) {
//         // back left
//         let yPos = 0.5;
//         let xPos = Math.tan(250 * Math.PI / 180) * yPos;
//         let pos = labelTool.camChannels[5].position;
//         controls.object.position.set(-pos[1] - xPos, pos[0] - labelTool.positionLidarNuscenes[0] - yPos, labelTool.positionLidarNuscenes[2] - pos[2]);
//         controls.target = new THREE.Vector3(-pos[1] - xPos - 0.00000001, pos[0] - labelTool.positionLidarNuscenes[0] - yPos - 0.000000001, labelTool.positionLidarNuscenes[2] - pos[2]);// look backward
//     } else {
//         // channel undefined
//     }
//     // camera.updateProjectionMatrix();
//     controls.update();
// }

// function setCameraToBirdsEyeView() {
//     camera = new THREE.OrthographicCamera(-40, 40, 20, -20, 0, 2000);
//     camera.position.set(0, 0, 450);
//     camera.up.set(0, 1, 0);
//     camera.lookAt(new THREE.Vector3(0, 0, 0));
//
//     controls = new THREE.OrbitControls(camera, renderer.domElement);
//     controls.enableRotate = false;
//     controls.enablePan = true;
//     controls.update();
// }

changeDataset = (datasetName) => {
    this.state.currentDataset = datasetName;
    this.props.reset();
    this.props.start();
}

changeSequence = (sequence) => {
    this.state.currentSequence = sequence;
    this.props.reset();
    this.props.start();
    // set height of panel slider

    // set height of all svg elements

    // set top of canvas3d element
}

readPointCloud = () => {
    let rawFile = new XMLHttpRequest();
    try {
        if (this.state.showOriginalNuScenesLabels === true) {
            rawFile.open("GET", 'input/' + this.state.currentDataset + '/pointclouds/' + this.props.pad(this.state.currentFileIndex, 6) + '.pcd', false);
        } else {
            rawFile.open("GET", 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/pointclouds/' + this.props.pad(this.state.currentFileIndex, 6) + '.pcd', false);
        }
    } catch (error) {
        // no labels available for this camera image
        // do not through an error message
    }

    let points3D = [];
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                let allText = rawFile.responseText;
                let allLines = allText.split("\n");
                for (let i = 0; i < allLines.length; i++) {
                    if (i < 11) {
                        // skip header
                        continue;
                    }
                    let points3DStringArray = allLines[i].split(" ");
                    let point3D = [];
                    // skip the last value (intensity)
                    for (let j = 0; j < points3DStringArray.length - 1; j++) {
                        let value = Number(points3DStringArray[j]);
                        // points are stored in meters within .h5 file and .pcd files
                        if (this.state.currentDataset === this.state.datasets.NuScenes) {
                            point3D.push(value);
                        }

                    }
                    // make point a 4x1 vector to multiply it with the 3x4 projection matrix P*X
                    point3D.push(1);
                    points3D.push(point3D);
                }
                return points3D;
            }
        }
    };
    rawFile.send(null);
    return points3D;
}

projectPoints = (points3D, channelIdx) => {
    let points2D = [];
    const currentPoints3D = this.state.currentPoints3D;

    // currentPoints3D = [];

    const currentDistances = this.state.currentDistances;
    // currentDistances = [];
    let projectionMatrix;
    let scalingFactor;
    let imagePanelHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    if (this.state.currentDataset === this.state.datasets.NuScenes) {
        scalingFactor = 900 / imagePanelHeight;
        projectionMatrix = this.props.camChannels[channelIdx].projectionMatrixNuScenes;
    }

    for (let i = 0; i < points3D.length; i++) {
        let point3D = points3D[i];
        let point2D = this.props.matrixProduct3x4(projectionMatrix, point3D);
        if (point2D[2] > 0) {
            // use only points that are in front of the camera
            let windowX = point2D[0] / point2D[2];
            let windowY = point2D[1] / point2D[2];
            currentPoints3D.push(point3D);
            // calculate distance
            let distance = Math.sqrt(Math.pow(point3D[0], 2) + Math.pow(point3D[1], 2) + Math.pow(point3D[2], 2));
            currentDistances.push(distance);
            points2D.push({x: windowX / scalingFactor, y: windowY / scalingFactor});
        }
    }
    return points2D;
}

normalizeDistances = () => {
    let maxDistance = 0;
    const currentDistances = this.state.currentDistances;

    for (let distanceIdx in currentDistances) {
        if (currentDistances.hasOwnProperty(distanceIdx)) {
            let distance = currentDistances[distanceIdx];
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
    }
    for (let i = 0; i < currentDistances.length; i++) {
        currentDistances[i] = (currentDistances[i] / (maxDistance)) * 255;
    }
}

// function filterPoints(points3D, channel) {
//     for (let ){
//
//     }
// }

showProjectedPoints = () => {
    let points3D = this.readPointCloud();
    const currentDistances = this.state.currentDistances;
    const circleArray = this.state.circleArray;
    const colorMap = this.state.colorMap;
    // circleArray
    for (let channelIdx = 0; channelIdx < this.props.camChannels.length; channelIdx++) {
        let paper = this.props.paperArrayAll[this.state.currentFileIndex][channelIdx];
        let points2D = this.projectPoints(points3D, channelIdx);
        this.normalizeDistances();
        for (let i = 0; i < points2D.length; i++) {
            let pt2D = points2D[i];
            let circle = paper.circle(pt2D.x, pt2D.y, 1);
            let distance = currentDistances[i];
            let color = colorMap[Math.floor(distance)];
            circle.attr("stroke", color);
            circle.attr("stroke-width", 1);
            circleArray.push(circle);
        }
    }

}

hideProjectedPoints = () => {
  const circleArray = this.state.circleArray;
    for (let i = circleArray.length - 1; i >= 0; i--) {
        let circle = circleArray[i];
        circle.remove();
        circleArray.splice(i, 1);
    }
}

loadColorMap = () => {
    let rawFile = new XMLHttpRequest();
    const colorMap = this.state.colorMap;
    try {
        rawFile.open("GET", 'assets/colormaps/' + this.state.activeColorMap, false);
    } catch (error) {
    }

    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                let allText = rawFile.responseText;
                colorMap = allText.replace(/"/g, '').split("\n");
            }
        }
    };
    rawFile.send(null);
}

onDocumentMouseWheel = (event) => {
  const renderer = this.state.renderer;
  const currentCamera = this.state.currentCamera;
  const container = this.state.container;

    let factor = 15;
    let mX = (event.clientX / $(container).width()) * 2 - 1;
    let mY = -(event.clientY / $(container).height()) * 2 + 1;
    let vector = new THREE.Vector3(mX, mY, 0.1);
    const currentOrbitControls = new TrackballControls(currentCamera, renderer.domElement);

    vector.unproject(currentCamera);
    vector.sub(currentCamera.position);
    if (event.deltaY < 0) {
        currentCamera.position.addVectors(currentCamera.position, vector.setLength(factor));
        currentOrbitControls.target.addVectors(currentOrbitControls.target, vector.setLength(factor));
    } else {
        currentCamera.position.subVectors(currentCamera.position, vector.setLength(factor));
        currentOrbitControls.target.subVectors(currentOrbitControls.target, vector.setLength(factor));
    }
}

onDocumentMouseMove = (event) => {
  const mousePos = this.state.mousePos;
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

increaseTrackId = (label, dataset) => {
    let classesBB;
    if (dataset === this.state.datasets.NuScenes) {
        classesBB = ClassesboundingBox.content;
    }

    // find out the lowest possible track id for a specific class

    for (let newTrackId = 1; newTrackId <= this.props.contents[this.state.currentFileIndex].length; newTrackId++) {
        let exist = false;
        for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
            if (label !== this.props.contents[this.state.currentFileIndex]["class"]) {
                continue;
            }
            if (newTrackId === this.props.contents[this.state.currentFileIndex][i]["trackId"]) {
                exist = true;
                break;
            }
        }
        if (exist === false) {
            // track id was not used yet
            return newTrackId;
        }
    }
    return -1;
}

disableStartPositionAndSize = () => {
  const interpolationObjIndexNextFile = this.state.interpolationObjIndexNextFile;
  const folderSizeArray = this.state.folderSizeArray;
  const folderPositionArray = this.state.folderPositionArray;
    // disable slider
    folderPositionArray[interpolationObjIndexNextFile].domElement.style.opacity = 0.2;
    folderPositionArray[interpolationObjIndexNextFile].domElement.style.pointerEvents = "none";
    folderSizeArray[interpolationObjIndexNextFile].domElement.style.opacity = 0.2;
    folderSizeArray[interpolationObjIndexNextFile].domElement.style.pointerEvents = "none";
}

enableStartPositionAndSize = () => {
  const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
  const folderSizeArray = this.state.folderSizeArray;
  const folderPositionArray = this.state.folderPositionArray;

    // disable slider
    folderPositionArray[interpolationObjIndexCurrentFile].domElement.style.opacity = 1.0;
    folderPositionArray[interpolationObjIndexCurrentFile].domElement.style.pointerEvents = "all";
    folderSizeArray[interpolationObjIndexCurrentFile].domElement.style.opacity = 1.0;
    folderSizeArray[interpolationObjIndexCurrentFile].domElement.style.pointerEvents = "all";
}

scatter = (vertices, size, color, texture = "") => {
    let geometry = new THREE.BufferGeometry();
    let settings = {
        size: size,
        sizeAttenuation: false,
        alphaTest: 0.5,
        transparent: true
    };
    if (texture !== "") {
        console.log(texture);
        settings["map"] = new THREE.TextureLoader().load(texture);
    }
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial(settings);
    material.color.set(color);
    return new THREE.Points(geometry, material);
}

updateBEV = (xPos, yPos, zPos) => {
  const headerHeight = this.state.headerHeight;
  const cameraBEV = this.state.cameraBEV;
  const canvasBEV = this.state.canvasBEV;

    let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let panelTopPos = headerHeight + imagePaneHeight;
    canvasBEV.left = "0px";
    canvasBEV.top = panelTopPos;

    cameraBEV.position.set(xPos, yPos, zPos + 100);
    cameraBEV.lookAt(xPos, yPos, zPos);
}

initBev = () => {
    const canvasBEV = document.createElement("canvas");
    const headerHeight = this.state.headerHeight;
    const scene = this.state.scene;

    canvasBEV.id = "canvasBev";
    let wBev = window.innerWidth / 3;
    canvasBEV.width = wBev;
    let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let hBev;
    hBev = (window.innerHeight - imagePaneHeight - headerHeight) / 3;
    canvasBEV.height = hBev;
    $("body").append(canvasBEV);
    $("#canvasBev").css("top", headerHeight + imagePaneHeight + 2 * hBev);

    const cameraBEV = new THREE.OrthographicCamera(window.innerWidth / -4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / -4, -5000, 10000);

    this.setState({
      cameraBEV: cameraBEV,
      canvasBEV: canvasBEV
    })
    cameraBEV.up = new THREE.Vector3(0, 0, -1);
    cameraBEV.lookAt(new THREE.Vector3(0, -1, 0));
    scene.add(cameraBEV);
}

showBEV = (xPos, yPos, zPos) => {
    if ($("#canvasBev").length === 0) {
        this.initBev();
    }
    this.updateBEV(xPos, yPos, zPos);
    $("#canvasBev").show();
}

initFrontView = () => {
  const scene = this.state.scene;
  const headerHeight = this.state.headerHeight;

    const canvasFrontView = document.createElement("canvas");
    canvasFrontView.id = "canvasFrontView";
    let widthFrontView = window.innerWidth / 3;
    canvasFrontView.width = widthFrontView;
    let imagePanelTopPos = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let heightFrontView;
    heightFrontView = (window.innerHeight - imagePanelTopPos - headerHeight) / 3;
    canvasFrontView.height = heightFrontView;

    this.setState({
      canvasFrontView: canvasFrontView
    })

    $("body").append(canvasFrontView);
    $("#canvasFrontView").css("top", headerHeight + imagePanelTopPos + heightFrontView);
    const cameraFrontView = new THREE.OrthographicCamera(window.innerWidth / -4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / -4, -5000, 10000);
    cameraFrontView.lookAt(new THREE.Vector3(0, 0, -1));
    scene.add(cameraFrontView);
}

updateFrontView = () =>{
  const headerHeight = this.state.headerHeight;
  const rendererFrontView = this.state.rendererFrontView;
  const canvasFrontView = this.state.canvasFrontView;

    let imagePanelTopPos = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let panelTopPos = imagePanelTopPos + headerHeight + 270;
    canvasFrontView.left = "0px";
    canvasFrontView.top = panelTopPos;
    if (rendererFrontView === undefined) {
        this.setState({
          rendererFrontView: rendererFrontView
        })
        // rendererFrontView = new THREE.WebGLRenderer({
        //     antialias: true
        // });
    }
    rendererFrontView.setSize(window.innerWidth, window.innerHeight);
    rendererFrontView.setClearColor(0x000000, 1);
    rendererFrontView.autoClear = false;
}

showFrontView = () => {
    if ($("#canvasFrontView").length === 0) {
        this.initFrontView();
    }
    this.updateFrontView();
    $("#canvasFrontView").show();
}

initSideView = () => {
  const scene = this.state.scene;
  const headerHeight = this.state.headerHeight;

    const canvasSideView = document.createElement("canvas");
    canvasSideView.id = "canvasSideView";
    let widthSideView = window.innerWidth / 3;
    let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let heightSideView;
    heightSideView = (window.innerHeight - imagePaneHeight - headerHeight) / 3;
    canvasSideView.width = widthSideView;
    canvasSideView.height = heightSideView;
    $("body").append(canvasSideView);
    $("#canvasSideView").css({top: imagePaneHeight + headerHeight + 'px'});

    const cameraSideView = new THREE.OrthographicCamera(window.innerWidth / -4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / -4, -5000, 10000);
    cameraSideView.lookAt(new THREE.Vector3(1, 0, 0));

    this.setState({
      cameraSideView: cameraSideView,
      canvasSideView: canvasSideView
    })
    // TODO: let user move bounding box also in helperviews (master view)
    // canvasSideView.addEventListener('mousemove', onDocumentMouseMove, false);
    //
    // canvasSideView.onmousedown = function (ev) {
    //     console.log("mouse down");
    //     handleMouseDown(ev);
    // };
    //
    // canvasSideView.onmouseup = function (ev) {
    //     handleMouseUp(ev);
    // };

    scene.add(cameraSideView);
    // cameraSideView.up.set(0, 0, -1);
    // cameraSideView.position.set(xPos - 10, yPos, zPos);

    // if (Detector.webgl) {
    //     rendererSideView = new THREE.WebGLRenderer({
    //         antialias: true
    //     });
    // } else {
    //     rendererSideView = new CanvasRenderer();
    // }


    // mapControlsSideView = new THREE.MapControls(cameraSideView, canvasSideView);
    // mapControlsSideView.enableRotate = false;
}

updateSideView = () => {
  const headerHeight = this.state.headerHeight;
  const canvasSideView = this.state.canvasSideView;

    let imagePaneHeight = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let panelTopPos = headerHeight + imagePaneHeight;
    canvasSideView.left = "0px";
    canvasSideView.top = panelTopPos;
}

showSideView = () => {
    if ($("#canvasSideView").length === 0) {
        this.initSideView();
    }
    this.updateSideView();
    $("#canvasSideView").show();

}

showHelperViews = (xPos, yPos, zPos) => {
    this.showSideView();
    this.showFrontView();
    this.showBEV(xPos, yPos, zPos);//width along x axis (lateral), height along y axis (longitudinal)
    // move class picker to right
    $("#class-picker").css("left", window.innerWidth / 3 + 10);
}

enableInterpolationModeCheckbox = (interpolationModeCheckbox) => {
    interpolationModeCheckbox.parentElement.parentElement.style.opacity = 1.0;
    interpolationModeCheckbox.parentElement.parentElement.style.pointerEvents = "all";
    $(interpolationModeCheckbox.firstChild).removeAttr("tabIndex");
}

enableInterpolationBtn = () =>{
  const interpolateBtn = this.state.interpolateBtn;

    interpolateBtn.domElement.parentElement.parentElement.style.pointerEvents = "all";
    interpolateBtn.domElement.parentElement.parentElement.style.opacity = 1.0;

}

mouseUpLogic = (ev) => {
  const scene = this.state.scene;
  const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
  const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
  const transformControls = this.state.transformControls;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;
  const folderPositionArray = this.state.folderPositionArray;
  const folderSizeArray = this.state.folderSizeArray;
  const interpolationMode = this.state.interpolationMode;
  const dragControls = this.state.dragControls;
  const useTransformControls = this.state.useTransformControls;
  const groundPointMouseDown = this.state.groundPointMouseDown;
  const clickedObjectIndexPrevious = this.state.clickedObjectIndexPrevious;
  const currentCamera = this.state.currentCamera;
  const clickedObjectIndex = this.state.clickedObjectIndex;
  const mouseUp = this.state.mouseUp;
  const clickedPlaneArray = this.state.clickedPlaneArray;
  const groundPlaneArray = this.state.groundPlaneArray; 
  const clickFlag = this.state.clickFlag;


    dragControls = false;
    // check if scene contains transform controls
    useTransformControls = false;
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].name === "transformControls") {
            useTransformControls = true;
        }
    }
    if (ev.button === 0) {
        let rect = ev.target.getBoundingClientRect();
        mouseUp.x = ((ev.clientX - rect.left) / $("#canvas3d canvas").attr("width")) * 2 - 1;
        mouseUp.y = -((ev.clientY - rect.top) / $("#canvas3d canvas").attr("height")) * 2 + 1;
        let ray = undefined;
        if (birdsEyeViewFlag === false) {
            let vector = new THREE.Vector3(mouseUp.x, mouseUp.y, 1);
            vector.unproject(currentCamera);
            ray = new THREE.Raycaster(currentCamera.position, vector.sub(currentCamera.position).normalize());
        } else {
            ray = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            mouse.x = mouseUp.x;
            mouse.y = mouseUp.y;
            ray.setFromCamera(mouse, currentCamera);
        }
        let clickedObjects;
        if (birdsEyeViewFlag === true) {
            clickedObjects = ray.intersectObjects(clickedPlaneArray);
        } else {
            clickedObjects = ray.intersectObjects(this.props.cubeArray[this.state.currentFileIndex]);
        }


        // close folders
        for (let i = 0; i < folderBoundingBox3DArray.length; i++) {
            if (folderBoundingBox3DArray[i] !== undefined) {
                folderBoundingBox3DArray[i].close();
            }
        }

        if (clickedObjects.length > 0 && clickedObjectIndex !== -1) {
            // one object was selected
            // for (let mesh in labelTool.cubeArray[this.state.currentFileIndex]) {
            //     let meshObject = labelTool.cubeArray[this.state.currentFileIndex][mesh];
            // meshObject.material.opacity = 0.1;
            // }
            // labelTool.cubeArray[this.state.currentFileIndex][clickedObjectIndex].material.opacity = 0.9;
            // open folder of selected object
            this.props.localOnSelect["PCD"](clickedObjectIndex);
            // set selected object

            this.props.selectedMesh = this.props.cubeArray[this.state.currentFileIndex][clickedObjectIndex];
            if (this.props.selectedMesh !== undefined) {
                for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
                    $("#tooltip-" + this.props.contents[this.state.currentFileIndex][i]["class"].charAt(0) + this.props.contents[this.state.currentFileIndex][i]["trackId"]).show();
                }
                $("#tooltip-" + this.props.contents[this.state.currentFileIndex][clickedObjectIndex]["class"].charAt(0) + this.props.contents[this.state.currentFileIndex][clickedObjectIndex]["trackId"]).hide();
                this.addTransformControls();

                if (transformControls.position !== undefined) {
                    transformControls.detach();
                    transformControls.attach(this.props.selectedMesh);
                }

                // if in birdseyeview then find minimum of longitude and latitude
                // otherwise find minimum of x, y and z
                // let smallestSide;
                // if (birdsEyeViewFlag === true) {
                //     smallestSide = Math.min(labelTool.selectedMesh.scale.x, labelTool.selectedMesh.scale.y);
                // } else {
                //     smallestSide = Math.min(Math.min(labelTool.selectedMesh.scale.x, labelTool.selectedMesh.scale.y), labelTool.selectedMesh.scale.z);
                // }
                // let size = smallestSide / 2.0;
                transformControls.size = 2;
            } else {
              this.props.removeObject("transformControls");
            }

            for (let channelIdx in this.props.camChannels) {
                if (this.props.camChannels.hasOwnProperty(channelIdx)) {
                    let camChannel = this.props.camChannels[channelIdx].channel;
                    this.props.select(clickedObjectIndex, camChannel);
                }
            }
            // uncolor previous selected object
            if (clickedObjectIndexPrevious !== -1) {
                this.update2DBoundingBox(this.state.currentFileIndex, clickedObjectIndexPrevious, false);
            }

            // select object in cam images
            this.update2DBoundingBox(this.state.currentFileIndex, clickedObjectIndex, true);
            // move button to right
            $("#left-btn").css("left", window.innerWidth / 3 - 70);

            let obj = this.props.contents[this.state.currentFileIndex][clickedObjectIndex];
            this.showHelperViews(obj["x"], obj["y"], obj["z"]);

            // enable interpolate button if interpolation mode is activated AND selected object is the same as interpolated object
            if (interpolationMode === true) {
                if (this.props.contents[this.state.currentFileIndex][clickedObjectIndex]["interpolationStartFileIndex"] !== -1 && this.props.contents[this.state.currentFileIndex][clickedObjectIndex]["interpolationStartFileIndex"] !== this.state.currentFileIndex) {
                  this.enableInterpolationBtn();
                } else {
                    interpolationObjIndexCurrentFile = clickedObjectIndex;
                    let obj = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile];
                    obj["interpolationStart"]["position"]["x"] = obj["x"];
                    obj["interpolationStart"]["position"]["y"] = obj["y"];
                    obj["interpolationStart"]["position"]["z"] = obj["z"];
                    obj["interpolationStart"]["position"]["rotationY"] = obj["rotationY"];
                    obj["interpolationStart"]["size"]["width"] = obj["width"];
                    obj["interpolationStart"]["size"]["length"] = obj["length"];
                    obj["interpolationStart"]["size"]["height"] = obj["height"];
                    obj["interpolationStartFileIndex"] = this.state.currentFileIndex;

                    folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + (this.state.currentFileIndex + 1) + ")";
                    folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + (this.state.currentFileIndex + 1) + ")";

                    if (clickedObjectIndexPrevious !== -1) {
                        folderPositionArray[clickedObjectIndexPrevious].domElement.firstChild.firstChild.innerText = "Position";
                        folderSizeArray[clickedObjectIndexPrevious].domElement.firstChild.firstChild.innerText = "Size";
                        // remove start position from previous selected object
                        this.props.contents[this.state.currentFileIndex][clickedObjectIndexPrevious]["interpolationStartFileIndex"] = -1;
                        this.props.contents[this.state.currentFileIndex][clickedObjectIndexPrevious]["interpolationStart"] = {
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
                        };
                        // enable copy checkbox of prev. object
                        let checkboxElemPrev = document.getElementById("copy-label-to-next-frame-checkbox-" + clickedObjectIndexPrevious);
                        this.enableCopyLabelToNextFrameCheckbox(checkboxElemPrev);
                        // disable copy checkbox of current obj
                        let checkboxElemCurrent = document.getElementById("copy-label-to-next-frame-checkbox-" + interpolationObjIndexCurrentFile);
                        this.disableCopyLabelToNextFrameCheckbox(checkboxElemCurrent);

                    }
                }
            }
            let interpolationModeCheckbox = document.getElementById("interpolation-checkbox");
            this.enableInterpolationModeCheckbox(interpolationModeCheckbox);
            // select corresponding class in class menu
            // get class name of selected object
            // get index of selected object within 5 classes (using class name)
            let classPickerElem = $('#class-picker ul li');
            classPickerElem.css('background-color', '#353535');
            $(classPickerElem[ClassesboundingBox[obj["class"]].index]).css('background-color', '#525252');


        } else {
            // remove selection in camera view if 2d label exist
            for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
                if (this.props.contents[this.state.currentFileIndex][i]["rect"] !== undefined) {
                    // removeBoundingBoxHighlight(i);
                    this.removeTextBox(i);
                }
            }

            // remove selection in birds eye view (lower opacity)
            for (let mesh in this.props.cubeArray[this.state.currentFileIndex]) {
                let meshObject = this.props.cubeArray[this.state.currentFileIndex][mesh];
                meshObject.material.opacity = 0.9;
            }

            // remove arrows (transform controls)
            if (transformControls !== undefined) {
                transformControls.detach();
            }
            this.props.removeObject("transformControls");
            this.props.selectedMesh = undefined;
            this.props.selectEmpty();

            // disable interpolate button
            this.disableInterpolationBtn();

            $("#canvasBev").hide();
            $("#canvasSideView").hide();
            $("#canvasFrontView").hide();
            // move class picker to left
            $("#class-picker").css("left", 10);

            let interpolationModeCheckbox = document.getElementById("interpolation-checkbox");
            this.disableInterpolationModeCheckbox(interpolationModeCheckbox);

            // move button to left
            $("#left-btn").css("left", -70);

        }

        if (clickFlag === true) {
            // clickedPlaneArray = [];
            const clickedPlaneArray = this.state.clickedPlaneArray;
            for (let channelIdx in this.props.camChannels) {
                if (this.props.camChannels.hasOwnProperty(channelIdx)) {
                    let camChannel = this.props.camChannels[channelIdx].channel;
                    this.props.select(clickedObjectIndex, camChannel);
                }
            }
            clickedObjectIndexPrevious = this.props.__selectionIndexCurrentFrame;
            clickFlag = false;
        } else if (groundPlaneArray.length === 1 && birdsEyeViewFlag === true && useTransformControls === false) {
            let groundUpObject = ray.intersectObjects(groundPlaneArray);
            let groundPointMouseUp = groundUpObject[0].point;

            let trackId = -1;
            let insertIndex;
            this.setHighestAvailableTrackId(ClassesboundingBox.targetName());
            if (this.state.showOriginalNuScenesLabels === true && this.state.currentDataset === this.state.datasets.NuScenes) {
                if (this.props.__selectionIndexCurrentFrame === -1) {
                    // no object selected in 3d scene (new object was created)-> use selected class from class menu
                    trackId = ClassesboundingBox.content[ClassesboundingBox.targetName()].nextTrackId;
                    insertIndex = this.props.contents[this.state.currentFileIndex].length;
                } else {
                    // object was selected in 3d scene
                    trackId = this.props.contents[this.state.currentFileIndex][this.props.__selectionIndexCurrentFrame]["trackId"];
                    insertIndex = this.props.__selectionIndexCurrentFrame;
                    clickedObjectIndexPrevious = this.props.__selectionIndexCurrentFrame;
                }
            } else {
                if (this.props.__selectionIndexCurrentFrame === -1) {
                    trackId = ClassesboundingBox[ClassesboundingBox.targetName()].nextTrackId;
                    insertIndex = this.props.contents[this.state.currentFileIndex].length;
                    clickedObjectIndexPrevious = this.props.contents[this.state.currentFileIndex].length;
                } else {
                    trackId = this.props.contents[this.state.currentFileIndex][this.props.__selectionIndexCurrentFrame]["trackId"];
                    insertIndex = this.props.__selectionIndexCurrentFrame;
                    clickedObjectIndexPrevious = this.props.__selectionIndexCurrentFrame;
                }
            }

            // set channel based on 3d position of new bonding box
            if (Math.abs(groundPointMouseUp.x - groundPointMouseDown.x) > 0.1) {
                let xPos = (groundPointMouseUp.x + groundPointMouseDown.x) / 2;
                let yPos = (groundPointMouseUp.y + groundPointMouseDown.y) / 2;
                let zPos = 0;

                // average car height in meters (ref: https://www.carfinderservice.com/car-advice/a-careful-look-at-different-sedan-dimensions)
                let defaultHeight = 1.468628;
                let addBboxParameters = this.props.getDefaultObject();
                addBboxParameters.class = ClassesboundingBox.targetName();
                addBboxParameters.x = xPos;
                addBboxParameters.y = yPos;
                addBboxParameters.z = zPos + defaultHeight / 2 - this.props.positionLidarNuscenes[2];
                addBboxParameters.width = Math.abs(groundPointMouseUp.x - groundPointMouseDown.x);
                addBboxParameters.length = Math.abs(groundPointMouseUp.y - groundPointMouseDown.y);
                addBboxParameters.height = defaultHeight;
                addBboxParameters.rotationY = 0;
                addBboxParameters.original = {
                    class: ClassesboundingBox.targetName(),
                    x: (groundPointMouseUp.x + groundPointMouseDown.x) / 2,
                    y: (groundPointMouseUp.y + groundPointMouseDown.y) / 2,
                    z: zPos + defaultHeight / 2 - this.props.positionLidarNuscenes[2],
                    width: Math.abs(groundPointMouseUp.x - groundPointMouseDown.x),
                    length: Math.abs(groundPointMouseUp.y - groundPointMouseDown.y),
                    height: defaultHeight,
                    rotationY: 0,
                    trackId: trackId
                };
                addBboxParameters.trackId = trackId;
                addBboxParameters.fromFile = false;
                addBboxParameters.fileIndex = this.state.currentFileIndex;
                addBboxParameters.copyLabelToNextFrame = false;

                if (interpolationMode === true) {
                    addBboxParameters["interpolationStart"]["position"]["x"] = addBboxParameters["x"];
                    addBboxParameters["interpolationStart"]["position"]["y"] = addBboxParameters["y"];
                    addBboxParameters["interpolationStart"]["position"]["z"] = addBboxParameters["z"];
                    addBboxParameters["interpolationStart"]["position"]["rotationY"] = addBboxParameters["rotationY"];
                    addBboxParameters["interpolationStart"]["size"]["width"] = addBboxParameters["width"];
                    addBboxParameters["interpolationStart"]["size"]["length"] = addBboxParameters["length"];
                    addBboxParameters["interpolationStart"]["size"]["height"] = addBboxParameters["height"];
                    addBboxParameters["interpolationStartFileIndex"] = this.state.currentFileIndex;
                }
                // set channel
                for (let i = 0; i < this.props.camChannels.length; i++) {
                    let channel = this.props.camChannels[i].channel;
                    let projectedBoundingBox = this.calculateProjectedBoundingBox(xPos, yPos, addBboxParameters.z, addBboxParameters.width, addBboxParameters.length, addBboxParameters.height, channel, addBboxParameters.rotationY);
                    addBboxParameters.channels[i].projectedPoints = projectedBoundingBox;
                }
                // calculate line segments
                for (let i = 0; i < addBboxParameters.channels.length; i++) {
                    let channelObj = addBboxParameters.channels[i];
                    if (channelObj.channel !== undefined && channelObj.channel !== '') {
                        if (addBboxParameters.channels[i].projectedPoints !== undefined && addBboxParameters.channels[i].projectedPoints.length === 8) {
                            let horizontal = addBboxParameters.width > addBboxParameters.length;
                            addBboxParameters.channels[i]["lines"] = this.calculateAndDrawLineSegments(channelObj, ClassesboundingBox.targetName(), horizontal, true);
                        }
                    }
                }
                this.props.set(insertIndex, addBboxParameters);
                this.props.selectedMesh = this.props.cubeArray[this.state.currentFileIndex][insertIndex];
                if (this.props.selectedMesh !== undefined) {
                  this.addTransformControls();
                } else {
                  this.props.removeObject("transformControls");
                }
                $("#tooltip-" + this.props.contents[this.state.currentFileIndex][insertIndex]["class"].charAt(0) + this.props.contents[this.state.currentFileIndex][insertIndex]["trackId"]).hide();
                // move left button to right
                $("#left-btn").css("left", window.innerWidth / 3 - 70);
                this.showHelperViews(xPos, yPos, zPos);


                this.props.__insertIndex++;
                ClassesboundingBox.target().nextTrackId++;
                for (let channelIdx in this.props.camChannels) {
                    if (this.props.camChannels.hasOwnProperty(channelIdx)) {
                        let camChannel = this.props.camChannels[channelIdx].channel;
                        this.props.select(insertIndex, camChannel);
                    }
                }
                let interpolationModeCheckbox = document.getElementById("interpolation-checkbox");
                this.enableInterpolationModeCheckbox(interpolationModeCheckbox);

                if (interpolationMode === true) {
                    interpolationObjIndexCurrentFile = insertIndex;
                }

            }

            this.setState({
              groundPlaneArray: []
            })
            // groundPlaneArray = [];
        }

    }
}

handleMouseUp = (ev) => {
  const rendererBev = this.state.rendererBev;
    if (rendererBev === undefined) {
      this.mouseUpLogic(ev);
    } else {
        if (ev.target !== rendererBev.domElement) {
            this.mouseUpLogic(ev);
        }
    }

}

mouseDownLogic = (ev) => {
  const scene = this.state.scene;
  const birdsEyeViewFlag = this.state.birdsEyeViewFlag;
  const groundPointMouseDown = this.state.groundPointMouseDown;
  const mouseDown = this.state.mouseDown;
  const currentCamera = this.state.currentCamera;
  const clickedPlaneArray = this.state.clickedPlaneArray;
  const groundPlaneArray = this.state.groundPlaneArray;
  const clickFlag = this.state.clickFlag;

    let rect = ev.target.getBoundingClientRect();
    mouseDown.x = ((ev.clientX - rect.left) / window.innerWidth) * 2 - 1;
    mouseDown.y = -((ev.clientY - rect.top) / window.innerHeight) * 2 + 1;
    let ray;
    if (birdsEyeViewFlag === false) {
        let vector = new THREE.Vector3(mouseDown.x, mouseDown.y, 1);
        vector.unproject(currentCamera);
        ray = new THREE.Raycaster(currentCamera.position, vector.sub(currentCamera.position).normalize());
    } else {
        ray = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        mouse.x = mouseDown.x;
        mouse.y = mouseDown.y;
        ray.setFromCamera(mouse, currentCamera);
    }
    let clickedObjects = ray.intersectObjects(this.props.cubeArray[this.state.currentFileIndex]);

    if (clickedObjects.length > 0) {

        if (ev.button === 0) {
            const clickedObjectIndex_ = this.props.cubeArray[this.state.currentFileIndex].indexOf(clickedObjects[0].object);

            this.setState({
              clickedObjectIndex: clickedObjectIndex_
            })
            
            clickFlag = true;
            const clickedPoint = clickedObjects[0].point;
            this.setState({
              clickedPoint: clickedPoint
            })
            // clickedCube = this.props.cubeArray[this.state.currentFileIndex][clickedObjectIndex_];
            const clickedCube = this.props.cubeArray[this.state.currentFileIndex][this.state.clickedObjectIndex];

            if (birdsEyeViewFlag === true) {
                let material = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    wireframe: false,
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide
                });
                let geometry = new THREE.PlaneGeometry(200, 200);
                let clickedPlane = new THREE.Mesh(geometry, material);
                clickedPlane.position.x = clickedPoint.x;
                clickedPlane.position.y = clickedPoint.y;
                clickedPlane.position.z = clickedPoint.z;
                let normal = clickedObjects[0].face;
                if ([normal.a, normal.b, normal.c].toString() == [6, 3, 2].toString() || [normal.a, normal.b, normal.c].toString() == [7, 6, 2].toString()) {
                    clickedPlane.rotation.x = Math.PI / 2;
                    clickedPlane.rotation.y = this.props.cubeArray[this.state.currentFileIndex][this.state.clickedObjectIndex].rotation.z;
                } else if ([normal.a, normal.b, normal.c].toString() == [6, 7, 5].toString() || [normal.a, normal.b, normal.c].toString() == [4, 6, 5].toString()) {
                    clickedPlane.rotation.x = -Math.PI / 2;
                    clickedPlane.rotation.y = -Math.PI / 2 - this.props.cubeArray[this.state.currentFileIndex][this.state.clickedObjectIndex].rotation.z;
                } else if ([normal.a, normal.b, normal.c].toString() == [0, 2, 1].toString() || [normal.a, normal.b, normal.c].toString() == [2, 3, 1].toString()) {
                    clickedPlane.rotation.x = Math.PI / 2;
                    clickedPlane.rotation.y = Math.PI / 2 + this.props.cubeArray[this.state.currentFileIndex][this.state.clickedObjectIndex].rotation.z;
                } else if ([normal.a, normal.b, normal.c].toString() == [5, 0, 1].toString() || [normal.a, normal.b, normal.c].toString() == [4, 5, 1].toString()) {
                    clickedPlane.rotation.x = -Math.PI / 2;
                    clickedPlane.rotation.y = -this.props.cubeArray[this.state.currentFileIndex][this.state.clickedObjectIndex].rotation.z;
                } else if ([normal.a, normal.b, normal.c].toString() == [3, 6, 4].toString() || [normal.a, normal.b, normal.c].toString() == [1, 3, 4].toString()) {
                    clickedPlane.rotation.y = -Math.PI
                }
                clickedPlane.name = "planeObject";
                scene.add(clickedPlane);
                clickedPlaneArray.push(clickedPlane);
            }

        } else if (ev.button === 2) {
            // rightclick
            const clickedObjectIndex_ = this.props.cubeArray[this.state.currentFileIndex].indexOf(clickedObjects[0].object);

            this.setState({
              clickedObjectIndex: clickedObjectIndex_
            })

            let bboxClass = this.props.contents[this.state.currentFileIndex][this.state.clickedObjectIndex]["class"];
            let trackId = this.props.contents[this.state.currentFileIndex][this.state.clickedObjectIndex]["trackId"];
            this.deleteObject(bboxClass, trackId, this.state.clickedObjectIndex);
            // move button to left
            $("#left-btn").css("left", -70);
        }//end right click
    } else {
        for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
            $("#tooltip-" + this.props.contents[this.state.currentFileIndex][i]["class"].charAt(0) + this.props.contents[this.state.currentFileIndex][i]["trackId"]).show();
        }
        if (birdsEyeViewFlag === true) {
            console.log("unselected");
            // clickedObjectIndex = -1;
            this.setState({
              clickedObjectIndex: -1,
              groundPlaneArray: []
            })

            // groundPlaneArray = [];
            let material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: false,
                transparent: true,//default: true
                opacity: 0.0,//oefault 0.0
                side: THREE.DoubleSide
            });
            let geometry = new THREE.PlaneGeometry(200, 200);
            let groundPlane = new THREE.Mesh(geometry, material);
            groundPlane.position.x = 0;
            groundPlane.position.y = 0;
            groundPlane.position.z = 0;
            this.state.groundPlaneArray.push(groundPlane);
            let groundObject = ray.intersectObjects(this.state.groundPlaneArray);
            groundPointMouseDown = groundObject[0].point;
        }
    }
}

handleMouseDown = (ev) => {
  const rendererBev = this.state.rendererBev;
    if (rendererBev === undefined) {
      this.mouseDownLogic(ev);
    } else {
        if (ev.target !== rendererBev.domElement) {
          this.mouseDownLogic(ev);
        }
    }
}

isFullscreen = () => {
    return Math.round(window.innerHeight * window.devicePixelRatio) === window.screen.height;
}

initViews = () => {
  const scene = this.state.scene;
  const headerHeight = this.state.headerHeight;
    let imagePanelTopPos = parseInt($("#layout_layout_resizer_top").css("top"), 10);
    let viewHeight;
    if (this.isFullscreen() === true) {
        viewHeight = Math.round((window.innerHeight - headerHeight - imagePanelTopPos) / 3);
    } else {
        viewHeight = Math.round((window.screen.height + 24 - headerHeight - imagePanelTopPos) / 3) - 40;
    }

    const views = [
        // main view
        {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            //background: new THREE.Color(22 / 256.0, 22 / 256.0, 22 / 256.0),
            background: new THREE.Color(1, 1, 1),
            up: [0, 1, 0],
            fov: 70
        },
        // side view
        {
            left: 0,
            top: 0,
            width: window.innerWidth / 3,
            height: viewHeight,
            background: new THREE.Color(22 / 256.0, 22 / 256.0, 22 / 256.0),
            up: [-1, 0, 0],
            fov: 70,
            updateCamera: (camera, scene, objectPosition) => {
                camera.position.set(objectPosition.x + 10, objectPosition.y, objectPosition.z);
                camera.lookAt(objectPosition);
            }
        },
        // front view
        {
            left: 0,
            top: viewHeight,
            width: window.innerWidth / 3,
            height: viewHeight,
            background: new THREE.Color(22 / 256.0, 22 / 256.0, 22 / 256.0),
            up: [0, -1, 0],
            fov: 70,
            updateCamera: (camera, scene, objectPosition) => {
                camera.position.set(objectPosition.x, objectPosition.y + 10, objectPosition.z);
                camera.lookAt(objectPosition);
            }
        },
        // BEV
        {
            left: 0,
            top: 2 * viewHeight,
            width: window.innerWidth / 3,
            height: viewHeight,
            background: new THREE.Color(22 / 256.0, 22 / 256.0, 22 / 256.0),
            up: [1, 0, 0],
            fov: 70,
            updateCamera: function (camera, scene, objectPosition) {
                camera.position.set(objectPosition.x, objectPosition.y, objectPosition.z + 10);
                camera.lookAt(objectPosition);
            }
        }
    ];
    $("#canvasSideView").css("height", viewHeight);
    console.log("init view: " + viewHeight);
    $("#canvasSideView").css("top", headerHeight + imagePanelTopPos);
    $("#canvasFrontView").css("height", viewHeight);
    $("#canvasFrontView").css("top", headerHeight + imagePanelTopPos + viewHeight);
    $("#canvasBev").css("height", viewHeight);
    $("#canvasBev").css("top", headerHeight + imagePanelTopPos + 2 * viewHeight);


    let mainView = views[0];
    let mainCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    mainCamera.position.set(10, 10, 10);//default
    mainCamera.up.fromArray(mainView.up);
    mainView.camera = mainCamera;
    for (let i = 1; i < views.length; i++) {
        let view = views[i];
        let top = 4;
        let bottom = -4;
        let aspectRatio = view.width / view.height;
        let left = bottom * aspectRatio;
        let right = top * aspectRatio;
        let camera = new THREE.OrthographicCamera(left, right, top, bottom, 0.001, 2000);
        camera.position.set(0, 0, 0);//default
        camera.up.fromArray(view.up);
        view.camera = camera;
    }
}

disableInterpolationModeCheckbox = (interpolationModeCheckbox) => {
    interpolationModeCheckbox.parentElement.parentElement.style.opacity = 0.2;
    interpolationModeCheckbox.parentElement.parentElement.style.pointerEvents = "none";
    interpolationModeCheckbox.firstChild.setAttribute("tabIndex", "-1");
}

disableCopyLabelToNextFrameCheckbox = (copyLabelToNextFrameCheckbox) => {
    copyLabelToNextFrameCheckbox.parentElement.parentElement.style.opacity = 0.2;
    copyLabelToNextFrameCheckbox.parentElement.parentElement.style.pointerEvents = "none";
    copyLabelToNextFrameCheckbox.firstChild.setAttribute("tabIndex", "-1");
}

enableCopyLabelToNextFrameCheckbox = (copyLabelToNextFrameCheckbox) => {
    copyLabelToNextFrameCheckbox.parentElement.parentElement.style.opacity = 1.0;
    copyLabelToNextFrameCheckbox.parentElement.parentElement.style.pointerEvents = "all";
    $(copyLabelToNextFrameCheckbox.firstChild).removeAttr("tabIndex");
}

disableInterpolationBtn = () => {
  const interpolateBtn = this.state.interpolateBtn;

    interpolateBtn.domElement.parentElement.parentElement.style.pointerEvents = "none";
    interpolateBtn.domElement.parentElement.parentElement.style.opacity = 0.2;
}

disableShowNuscenesLabelsCheckbox = (showNuScenesLabelsCheckbox) => {
    showNuScenesLabelsCheckbox.parentElement.parentElement.parentElement.style.pointerEvents = "none";
    showNuScenesLabelsCheckbox.parentElement.parentElement.parentElement.style.opacity = 0.2;
    showNuScenesLabelsCheckbox.tabIndex = -1;
}

enableShowNuscenesLabelsCheckbox = (showNuScenesLabelsCheckbox) => {
    showNuScenesLabelsCheckbox.parentElement.parentElement.parentElement.style.pointerEvents = "all";
    showNuScenesLabelsCheckbox.parentElement.parentElement.parentElement.style.opacity = 1.0;
    $(showNuScenesLabelsCheckbox.firstChild).removeAttr("tabIndex");
}

enableChooseSequenceDropDown = (chooseSequenceDropDown) => {
    chooseSequenceDropDown.parentElement.parentElement.parentElement.style.pointerEvents = "all";
    chooseSequenceDropDown.parentElement.parentElement.parentElement.style.opacity = 1.0;
    $(chooseSequenceDropDown.firstChild).removeAttr("tabIndex");
}

disableChooseSequenceDropDown = (chooseSequenceDropDown) => {
    chooseSequenceDropDown.parentElement.parentElement.style.pointerEvents = "none";
    chooseSequenceDropDown.parentElement.parentElement.style.opacity = 0.2;
    chooseSequenceDropDown.tabIndex = -1;
}

createGrid = () => {
  const scene = this.state.scene;
  const showGridFlag = this.state.showGridFlag;

  this.props.removeObject("grid");
    const grid = new THREE.GridHelper(100, 100);

    this.setState({
      grid: grid
    })
    let posZLidar;
    if (this.state.currentDataset === this.state.datasets.NuScenes) {
        posZLidar = this.props.positionLidarNuscenes[2];
    }
    grid.translateZ(-posZLidar);
    grid.rotateX(Math.PI / 2);
    grid.name = "grid";
    if (showGridFlag === true) {
        grid.visible = true;
    } else {
        grid.visible = false;
    }
    scene.add(grid);
}

toggleKeyboardNavigation = () => {
  const keyboardNavigation = this.state.keyboardNavigation;

    keyboardNavigation = !keyboardNavigation;
    if (keyboardNavigation === true) {
        this.setPointerLockControls();
    } else {
        this.setOrbitControls();
    }
}

// function canvas3DKeyUpHandler(event) {
//     if (keyboardNavigation === true) {
//         switch (event.keyCode) {
//             case 38: // up
//                 break;
//             case 87: // w
//                 moveForward = false;
//                 console.log("move forward false");
//                 break;
//             case 37: // left
//                 break;
//             case 65: // a
//                 moveLeft = false;
//                 console.log("move left false");
//                 break;
//             case 40: // down
//                 break;
//             case 83: // s
//                 moveBackward = false;
//                 break;
//             case 39: // right
//                 break;
//             case 68: // d
//                 moveRight = false;
//                 break;
//         }
//     }
// }

canvas3DKeyDownHandler = (event) => {
    switch (event.keyCode) {
        case 75: //K
            this.toggleKeyboardNavigation();
            break;
    }
    // if (keyboardNavigation === true) {
    //     switch (event.keyCode) {
    //         case 38: // up
    //             break;
    //         case 87: // w
    //             moveForward = true;
    //             console.log("move forward true");
    //             break;
    //         case 37: // left
    //             break;
    //         case 65: // a
    //             moveLeft = true;
    //             console.log("move left true");
    //             break;
    //         case 40: // down
    //             break;
    //         case 83: // s
    //             moveBackward = true;
    //             break;
    //         case 39: // right
    //             break;
    //         case 68: // d
    //             moveRight = true;
    //             break;
    //     }
    // }
    // if (keyboardNavigation === true) {
    //     let delta = 1;
    //     switch (event.keyCode) {
    //         case 37: // LEFT
    //             currentCamera.position.x = currentCamera.position.x - delta;
    //             break;
    //         case 38: // UP
    //             currentCamera.position.z = currentCamera.position.z - delta;
    //             break;
    //         case 39: // RIGHT
    //             currentCamera.position.x = currentCamera.position.x + delta;
    //             break;
    //         case 40: // DOWN
    //             currentCamera.position.z = currentCamera.position.z + delta;
    //             break;
    //     }
    //     currentCamera.updateProjectionMatrix();
    // }
}

loadDetectedBoxes = () => {
    let rawFile = new XMLHttpRequest();
    try {
        rawFile.open("GET", 'input/' + this.state.currentDataset + '/' + this.state.currentSequence + '/detections/detections_lidar.txt', false);
    } catch (error) {
    }

    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                let allText = rawFile.responseText;
                let allLines = allText.replace(/"/g, '').split("\n");
                let objectIndexWithinFrame = 0;
                let frameNumber = 1;
                let frameNumberPrevious = -1;
                for (let i = 0; i < allLines.length; i++) {
                    let line = allLines[i];
                    if (line === "") {
                        continue;
                    }
                    let params = this.props.getDefaultObject();
                    let attributes = line.split(",");
                    frameNumber = parseFloat(attributes[0].trim().split(" ")[1]);
                    if (frameNumber === frameNumberPrevious) {
                        objectIndexWithinFrame = objectIndexWithinFrame + 1;
                    } else {
                        objectIndexWithinFrame = 0;
                    }
                    frameNumberPrevious = frameNumber;
                    params.x = parseFloat(attributes[1].trim().split(" ")[2]);
                    params.y = parseFloat(attributes[2].trim().split(" ")[2]);
                    params.z = parseFloat(attributes[3].trim().split(" ")[2]);
                    params.original.x = params.x;
                    params.original.y = params.y;
                    params.original.z = params.z;
                    let tmpLength = parseFloat(attributes[4].trim().split(" ")[2]);
                    let tmpWidth = parseFloat(attributes[5].trim().split(" ")[2]);
                    let tmpHeight = parseFloat(attributes[6].trim().split(" ")[2]);
                    let rotationY = parseFloat(attributes[7].trim().split(" ")[1]);
                    params.class = "Vehicle";
                    params.rotationY = rotationY;
                    params.original.rotationY = rotationY;
                    params.trackId = objectIndexWithinFrame + 1;
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
                    params.fileIndex = frameNumber - 1;
                    this.props.set(objectIndexWithinFrame, params);
                    ClassesboundingBox.target().nextTrackId++;
                }
            }
        }
    };
    rawFile.send(null);
}

init = () => {
    //if (this.WEBGL.isWebGLAvailable() === false) {
    //    document.body.appendChild(this.WEBGL.getWebGLErrorMessage());
    //}

    

    const currentState = this.state;
    /**
     * CameraControls
     */
    // function CameraControls() {
    //     //constructor
    // }

    // CameraControls.prototype = {
    //     constructor: CameraControls,
    //     update: function (camera, keyboard, clock) {
    //         //functionality to go here
    //         let delta = clock.getDelta(); // seconds.
    //         let moveDistance = 10 * delta; // 200 pixels per second
    //         let rotateAngle = delta;   // pi/2 radians (90 degrees) per second
    //         if (keyboard.pressed("w")) {
    //             // camera.translateZ(-moveDistance);
    //             let angle = Math.abs(camera.rotation.y + Math.PI / 2);
    //             let posX = camera.position.x + Math.cos(angle) * moveDistance;
    //             let posY = camera.position.y + Math.sin(angle) * moveDistance;
    //             camera.position.set(posX, posY, camera.position.z);
    //         }
    //         if (keyboard.pressed("s")) {
    //             let angle = Math.abs(camera.rotation.y + Math.PI / 2);
    //             moveDistance = -moveDistance;
    //             let posX = camera.position.x + Math.cos(angle) * moveDistance;
    //             let posY = camera.position.y + Math.sin(angle) * moveDistance;
    //             camera.position.set(posX, posY, camera.position.z);
    //             // camera.position.set(0, 0, camera.position.z + moveDistance);
    //             // camera.translateZ(moveDistance);
    //         }
    //         if (keyboard.pressed("a")) {
    //             camera.translateX(-moveDistance);//great!
    //         }
    //         if (keyboard.pressed("d")) {
    //             camera.translateX(moveDistance);//great!
    //         }
    //         if (keyboard.pressed("q")) {
    //             camera.position.z = camera.position.z - moveDistance;
    //         }
    //         if (keyboard.pressed("e")) {
    //             camera.position.z = camera.position.z + moveDistance;
    //         }
    //
    //         if (keyboard.pressed("left")) {
    //             camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
    //         }
    //         if (keyboard.pressed("right")) {
    //             camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    //         }
    //         // if (keyboard.pressed("up")) {
    //         //     camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
    //         // }
    //         // if (keyboard.pressed("down")) {
    //         //     camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);
    //         // }
    //
    //
    //     }
    // };
    //
    // cameraControls = new CameraControls();
    // keyboard = new THREEx.KeyboardState();

    const keyboard = this.state.keyboard;
    const clock = this.state.clock;
    // state 값 
    const scene = this.state.scene;
    const canvas3D = this.state.canvas3D;
    // render 값 
    // const renderer = this.state.renderer;/
    const projector = this.state.projector;
    const folderBoundingBox3DArray = this.state.folderBoundingBox3DArray;
    const interpolationObjIndexCurrentFile = this.state.interpolationObjIndexCurrentFile;
    const pointCloudScanNoGroundList = this.state.pointCloudScanNoGroundList;
    const pointCloudScanList = this.state.pointCloudScanList;
    const birdsEyeViewFlag = this.state.birdsEyeViewFlag;
    const folderPositionArray = this.state.folderPositionArray;
    const folderSizeArray = this.state.folderSizeArray;
    const interpolationMode = this.state.interpolationMode;
    const guiAnnotationClasses = this.state.guiAnnotationClasses;
    const parametersBoundingBox = this.state.parametersBoundingBox;
    // const guiOptions = this.state.guiOptions;
    const guiOptionsOpened = this.state.guiOptionsOpened;
    const showProjectedPointsFlag = this.state.showProjectedPointsFlag;
    const filterGround = this.state.filterGround;
    const guiBoundingBoxAnnotationMap = this.state.guiBoundingBoxAnnotationMap;
    const grid = this.state.grid;
    const interpolateBtn = this.state.interpolateBtn;

    

    // keyboard = new KeyboardState();
    // clock = new THREE.Clock();
    // container = document.createElement('div');
    // document.body.appendChild(container);

    // scene = new THREE.Scene();

    scene.background = new THREE.Color(0x323232);

    scene.fog = new THREE.Fog(scene.background, 3500, 15000);

    let axisHelper = new THREE.AxisHelper(1);
    axisHelper.position.set(0, 0, 0);
    scene.add(axisHelper);

    let light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(0, 0, 6).normalize();
    scene.add(light);

    let canvas3D_div = document.getElementById('canvas3d');


    if (birdsEyeViewFlag === false) {
      canvas3D_div.removeEventListener('keydown', this.canvas3DKeyDownHandler);
      canvas3D_div.addEventListener('keydown', this.canvas3DKeyDownHandler);
    }

    window.removeEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keydown', this.keyDownHandler);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        clearColor: 0x000000,
        clearAlpha: 0,
        alpha: true,
        preserveDrawingBuffer: true
    });

    // setstate
    this.setState({
      renderer: renderer,
      canvas3D: canvas3D_div
    })
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    this.setCamera();
    this.createGrid();

    if ($("#canvas3d").children().size() > 0) {
        $($("#canvas3d").children()[0]).remove();
    }
    canvas3D.appendChild(renderer.domElement);

    // stats = new Stats();
    // canvas3D.appendChild(stats.dom);
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    projector = new Projector();
    canvas3D.addEventListener('mousemove', this.onDocumentMouseMove, false);

    canvas3D.onmousedown = function (ev) {
      this.handleMouseDown(ev);
    };

    canvas3D.onmouseup = function (ev) {
      this.handleMouseUp(ev);
    };

    this.props.cubeArray = [];
    this.props.spriteArray = [];
    this.props.savedFrames = [];
    this.props.contents = [];
    for (let i = 0; i < this.state.numFrames; i++) {
      this.props.cubeArray.push([]);
      this.props.spriteArray.push([]);
      this.props.savedFrames.push([]);
      this.props.contents.push([]);
    }

    if (guiBoundingBoxAnnotationMap === undefined) {
        guiBoundingBoxAnnotationMap = {
            "Vehicle": guiAnnotationClasses.add(parametersBoundingBox, "Vehicle").name("Vehicle"),
            "Truck": guiAnnotationClasses.add(parametersBoundingBox, "Truck").name("Truck"),
            "Motorcycle": guiAnnotationClasses.add(parametersBoundingBox, "Motorcycle").name("Motorcycle"),
            "Bicycle": guiAnnotationClasses.add(parametersBoundingBox, "Bicycle").name("Bicycle"),
            "Pedestrian": guiAnnotationClasses.add(parametersBoundingBox, "Pedestrian").name("Pedestrian"),
        };
        guiAnnotationClasses.domElement.id = 'class-picker';
        // 3D BB controls
        // 임시주석 처리
        // guiOptions.add(parameters, 'download').name("Download Annotations");
        // guiOptions.add(parameters, 'download_video').name("Download Video");
        // guiOptions.add(parameters, 'undo').name("Undo");
        // guiOptions.add(parameters, 'switch_view').name("Switch view");
        // let showOriginalNuScenesLabelsCheckbox = guiOptions.add(parameters, 'show_nuscenes_labels').name('NuScenes Labels').listen();
        // showOriginalNuScenesLabelsCheckbox.onChange(function (value) {
        //     this.state.showOriginalNuScenesLabels = value;
        //     if (this.state.showOriginalNuScenesLabels === true) {
        //         // TODO: improve:
        //         // - do not reset
        //         // - show current labels and in addition nuscenes labels
        //         this.props.reset();
        //         this.props.start();
        //     } else {
        //         // TODO: hide nuscenes labels (do not reset)
        //         this.props.reset();
        //         this.props.start();
        //     }
        // });
        let allCheckboxes = $(":checkbox");
        let showNuScenesLabelsCheckbox = allCheckboxes[0];
        if (this.state.currentDataset === this.state.datasets.NuScenes) {
          this.enableShowNuscenesLabelsCheckbox(showNuScenesLabelsCheckbox);
        }
        let chooseSequenceDropDown;
        // guiOptions.add(parameters, 'datasets', ['NuScenes']).name("Choose dataset")
        //     .onChange(function (value) {
        //       this.changeDataset(value);
        //         let allCheckboxes = $(":checkbox");
        //         let showNuScenesLabelsCheckbox = allCheckboxes[0];
        //         if (value === this.state.datasets.NuScenes) {
        //           this.enableShowNuscenesLabelsCheckbox(showNuScenesLabelsCheckbox);
        //           this.disableChooseSequenceDropDown(chooseSequenceDropDown.domElement);
        //         }
        //         this.hideMasterView();
        //     });
        // chooseSequenceDropDown = guiOptions.add(parameters, 'sequences', [
        //   this.props.sequencesNuScenes[0]]).name("Choose Sequence")
        //     .onChange(function (value) {
        //       this.changeSequence(value);
        //       this.hideMasterView();
        //     });

        // let showFieldOfViewCheckbox = guiOptions.add(parameters, 'show_field_of_view').name('Field-Of-View').listen();
        // showFieldOfViewCheckbox.onChange(function (value) {
        //   this.props.showFieldOfView = value;
        //     if (this.props.showFieldOfView === true) {
        //       this.props.removeObject('rightplane');
        //       this.props.removeObject('leftplane');
        //       this.props.removeObject('prism');
        //       this.props.drawFieldOfView();
        //     } else {
        //       this.props.removeObject('rightplane');
        //       this.props.removeObject('leftplane');
        //       this.props.removeObject('prism');
        //     }
        // });
        // let showProjectedPointsCheckbox = guiOptions.add(parameters, 'show_projected_points').name('Show projected points').listen();
        // showProjectedPointsCheckbox.onChange(function (value) {
        //     showProjectedPointsFlag = value;
        //     if (showProjectedPointsFlag === true) {
        //       this.showProjectedPoints();
        //     } else {
        //       this.hideProjectedPoints();
        //     }
        // });
        // let showGridCheckbox = guiOptions.add(parameters, 'show_grid').name('Show grid').listen();
        // showGridCheckbox.onChange(function (value) {
        //     this.setState({
        //       showGridFlag: value
        //     })
        //     // showGridFlag = value;
        //     //let grid = scene.getObjectByName("grid");
        //     if (grid === undefined || grid.parent === null) {
        //       this.createGrid();
        //     }
        //     if (this.state.showGridFlag === true) {
        //         grid.visible = true;
        //     } else {
        //         grid.visible = false;
        //     }
        // });
        // let filterGroundCheckbox = guiOptions.add(parameters, 'filter_ground').name('Filter ground').listen();
        // filterGroundCheckbox.onChange(function (value) {
        //     filterGround = value;
        //     if (filterGround === true) {
        //       this.props.removeObject("pointcloud-scan-" + this.state.currentFileIndex);
        //         this.addObject(pointCloudScanNoGroundList[this.state.currentFileIndex], "pointcloud-scan-no-ground-" + this.state.currentFileIndex);
        //     } else {
        //       this.props.removeObject("pointcloud-scan-no-ground-" + this.state.currentFileIndex);
        //         this.addObject(pointCloudScanList[this.state.currentFileIndex], "pointcloud-scan-" + this.state.currentFileIndex);
        //     }
        // });

        // let hideOtherAnnotationsCheckbox = guiOptions.add(parameters, 'hide_other_annotations').name('Hide other annotations').listen();
        // const hideOtherAnnotations = this.state.hideOtherAnnotations;
        // hideOtherAnnotationsCheckbox.onChange(function (value) {

        //     this.setState({
        //       hideOtherAnnotations: value
        //     })
        //     // hideOtherAnnotations = value;
        //     let selectionIndex = this.props.getSelectionIndex();
        //     if (this.state.hideOtherAnnotations === true) {
        //         for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
        //             // remove 3D labels
        //             let mesh = this.props.cubeArray[this.state.currentFileIndex][i];
        //             mesh.material.opacity = 0;
        //             // remove all 2D labels
        //             for (let j = 0; j < this.props.contents[this.state.currentFileIndex][i].channels.length; j++) {
        //                 let channelObj = this.props.contents[this.state.currentFileIndex][i].channels[j];
        //                 // remove drawn lines of all 6 channels
        //                 for (let lineObj in channelObj.lines) {
        //                     if (channelObj.lines.hasOwnProperty(lineObj)) {
        //                         let line = channelObj.lines[lineObj];
        //                         if (line !== undefined) {
        //                             line.remove();
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //         if (selectionIndex !== -1) {
        //             // draw selected object in 2D and 3D
        //             this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
        //         }
        //     } else {
        //         for (let i = 0; i < this.props.contents[this.state.currentFileIndex].length; i++) {
        //             // show 3D labels
        //             let mesh = this.props.cubeArray[this.state.currentFileIndex][i];
        //             mesh.material.opacity = 0.9;
        //             // show 2D labels
        //             if (selectionIndex === i) {
        //                 // draw selected object in 2D and 3D
        //                 this.update2DBoundingBox(this.state.currentFileIndex, selectionIndex, true);
        //             } else {
        //                 if (selectionIndex !== -1) {
        //                   this.update2DBoundingBox(this.state.currentFileIndex, i, false);
        //                 }
        //             }

        //         }
        //     }

        // });

        // guiOptions.add(parameters, 'select_all_copy_label_to_next_frame').name("Select all 'Copy label to next frame'");
        // guiOptions.add(parameters, 'unselect_all_copy_label_to_next_frame').name("Unselect all 'Copy label to next frame'");


        // let interpolationModeCheckbox = guiOptions.add(parameters, 'interpolation_mode').name('Interpolation Mode');
        // interpolationModeCheckbox.domElement.id = 'interpolation-checkbox';
        // // if scene contains no objects then deactivate checkbox
        // // ajax_wrapper.js에 있음
        // if (this.props.annotationFileExist(undefined, undefined) === false || interpolationMode === false) {
        //     // no annotation file exist -> deactivate checkbox
        //     this.disableInterpolationModeCheckbox(interpolationModeCheckbox.domElement);
        // }

        // interpolationModeCheckbox.onChange(function (value) {
        //     interpolationMode = value;
        //     if (interpolationMode === true) {
        //         interpolationObjIndexCurrentFile = this.props.getSelectionIndex();
        //         if (interpolationObjIndexCurrentFile !== -1) {
        //             // set interpolation start position
        //             let obj = this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile];
        //             obj["interpolationStart"]["position"]["x"] = obj["x"];
        //             obj["interpolationStart"]["position"]["y"] = obj["y"];
        //             obj["interpolationStart"]["position"]["z"] = obj["z"];
        //             obj["interpolationStart"]["position"]["rotationY"] = obj["rotationY"];
        //             obj["interpolationStart"]["size"]["width"] = obj["width"];
        //             obj["interpolationStart"]["size"]["length"] = obj["length"];
        //             obj["interpolationStart"]["size"]["height"] = obj["height"];
        //             // short interpolation start index (Interpolation Start Position (frame 400)
        //             folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Position (frame " + (this.state.currentFileIndex + 1) + ")";
        //             folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Interpolation Start Size (frame " + (this.state.currentFileIndex + 1) + ")";
        //             // set start index
        //             this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["interpolationStartFileIndex"] = this.state.currentFileIndex;
        //         }
        //         // check 'copy label to next frame' of selected object
        //         this.props.contents[this.state.currentFileIndex][interpolationObjIndexCurrentFile]["copyLabelToNextFrame"] = true;
        //         let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + interpolationObjIndexCurrentFile);
        //         checkboxElem.firstChild.checked = true;
        //         // disable checkbox
        //         this.disableCopyLabelToNextFrameCheckbox(checkboxElem);
        //     } else {
        //       this.disableInterpolationBtn();
        //         if (interpolationObjIndexCurrentFile !== -1) {
        //             folderPositionArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Position";
        //             folderSizeArray[interpolationObjIndexCurrentFile].domElement.firstChild.firstChild.innerText = "Size";
        //             this.enableStartPositionAndSize();
        //             //[1].__folders[""Interpolation End Position (frame 1)""]
        //             for (let i = 0; i < folderBoundingBox3DArray.length; i++) {
        //                 // get all keys of folders object
        //                 let keys = Object.keys(folderBoundingBox3DArray[i].__folders);
        //                 for (let j = 0; j < keys.length; j++) {
        //                     if (keys[j].startsWith("Interpolation End")) {
        //                         folderBoundingBox3DArray[i].removeFolder(keys[j]);
        //                     }
        //                 }
        //             }
        //             // folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Position (frame " + (labelTool.previousFileIndex + 1) + ")");
        //             // folderBoundingBox3DArray[interpolationObjIndexCurrentFile].removeFolder("Interpolation End Size (frame " + (labelTool.previousFileIndex + 1) + ")");
        //             // enable checkbox
        //             let checkboxElem = document.getElementById("copy-label-to-next-frame-checkbox-" + interpolationObjIndexCurrentFile);
        //             this.enableCopyLabelToNextFrameCheckbox(checkboxElem);
        //         }
        //         interpolationObjIndexCurrentFile = -1;

        //     }
        // });
        // interpolateBtn = guiOptions.add(parameters, 'interpolate').name("Interpolate");
        // interpolateBtn.domElement.id = 'interpolate-btn';
        // this.disableInterpolationBtn();

        // guiOptions.add(parameters, 'reset_all').name("Reset all");
        // guiOptions.add(parameters, 'skip_frames').name("Skip frames").onChange(function (value) {
        //     if (value === "") {
        //         value = 1;
        //     } else {
        //         value = parseInt(value);
        //     }
        //     this.props.skipFrameCount = value;
        // });


        // guiOptions.domElement.id = 'bounding-box-3d-menu';
        // // add download Annotations button
        // let downloadAnnotationsItem = $($('#bounding-box-3d-menu ul li')[0]);
        // let downloadAnnotationsDivItem = downloadAnnotationsItem.children().first();
        // downloadAnnotationsDivItem.wrap("<a href=\"\"></a>");
        // this.loadColorMap();
        // if (showProjectedPointsFlag === true) {
        //   this.showProjectedPoints();
        // } else {
        //   this.hideProjectedPoints();
        // }
    }
    let classPickerElem = $('#class-picker ul li');
    classPickerElem.css('background-color', '#353535');
    $(classPickerElem[0]).css('background-color', '#525252');
    classPickerElem.css('border-bottom', '0px');


    $('#bounding-box-3d-menu').css('width', '480px');
    $('#bounding-box-3d-menu ul li').css('background-color', '#353535');
    // 임시주석 처리 gui부분
    // $("#bounding-box-3d-menu .close-button").click(function () {
    //     guiOptionsOpened = !guiOptionsOpened;
    //     if (guiOptionsOpened === true) {
    //         $("#right-btn").css("right", 430);
    //     } else {
    //         $("#right-btn").css("right", -50);
    //     }
    // });

    // guiOptions.open();
    classPickerElem.each(function (i, item) {
        let propNamesArray = Object.getOwnPropertyNames(ClassesboundingBox);
        let color = ClassesboundingBox[propNamesArray[i]].color;
        let attribute = "20px solid" + ' ' + color;
        $(item).css("border-left", attribute);
        $(item).css('border-bottom', '0px');
    });

    // let elem = $("#label-tool-log");
    // elem.val("1. Draw bounding box ");
    // elem.css("color", "#969696");

    this.initViews();

}

render(){
  return(
    <div className="App">
      <header className="App-header">
       PCD_LABEL_TOOLS
      </header>
    </div>
  )
}
}
