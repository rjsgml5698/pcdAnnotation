import React from 'react';
//import AjaxWrapper from './component/ajax_wrapper.js';
//import ImagebabelTool from './component/image_label_tool.js';
//import BasebabelTool from './component/base_label_tool.js';
import PcdbabelTool from './component/pcd_label_tool.js';
// import boundingbox from './component/boundingbox';
// import ClassBoundingBox from './component/ClassBoundingBox';
// import createColorMap from './component/createColorMap';
// import createColorMapBrowser from './component/createColorMapBrowser';
// import Math from './component/Math';

// console.log("AjaxWrapper", AjaxWrapper);
// console.log("boundingbox", boundingbox);
// console.log("ImageBabel_tool", ImageBabel_tool);
// console.log("Math", Math/);

function App() {
  console.log("PcdbabelTool", PcdbabelTool);
  return (
    <div className="App">
      <header className="App-header">
       <PcdbabelTool />
      </header>
    </div>
  );
}

export default App;
