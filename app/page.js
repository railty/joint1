"use client"

import { useState, useRef, useEffect } from 'react'
import * as joint from 'jointjs';
import * as path from 'path';

export default function Home() {
  const width = 1600;
  const height = 2000;

  const initX = 40;
  const initY = 20;
  const stepX = 120;
  const stepY = 60;
  const w = 100;
  const h = 40;

  const nextX = ()=>{
    pos.x += stepX;
    if (pos.x > width) {
      pos.x = initX;
      pos.y += stepY;
    }
  }
  const nextY = ()=>{
    pos.x = initX;
    pos.y += stepY;
  }

  const [count, setCount] = useState(0)
  const [graph, setGraph] = useState(null)
  const refDiv = useRef();
  const refDiv2 = useRef();

  const addBlock=(text, x, y)=>{
    const rect = new joint.shapes.standard.Rectangle();
    rect.position(x, y);
    rect.resize(w, h);
    rect.attr({
        body: {
            fill: 'blue'
        },
        label: {
            text: text,
            fill: 'white'
        }
    });
    rect.addTo(graph);
    return rect;
  }

  const addLink=(source, target)=>{
    const link = new joint.shapes.standard.Link();
    link.source(source);
    link.target(target);
    link.router('orthogonal');
    link.connector('rounded');
    link.addTo(graph);
  }

  let files = {};
  let deps = null;
  const addFile = (file, x, y)=>{
    let source = files[file];
    let ix = x;
    let iy = y;

    if (!source) {
      source = addBlock(file, x, y);
      ix = initX;
      iy = y + stepY;
      files[file] = source;
    }
    if(deps[file]){
      for (let depFile of Object.keys(deps[file])){
        let target = addFile(depFile, ix, iy);
        ix += stepX;
        if (ix > width) {
          ix = initX;
          iy += stepY;
        }
  
        addLink(source, target);
      }
    }
    return source;
  }

  const importDeps = async () => {

    const data = await getData("/api/import");
    deps = JSON.parse(data.deps);
    const newDeps = {};

    for (let dep of Object.keys(deps)){
      const p = (path.parse(dep)).dir;
      const files = deps[dep];

      const newFiles = {};
      for(let f of Object.keys(files)){
        const newFile = path.resolve(p, f);
        newFiles[newFile] = files[f];
      }

      const newDep = path.resolve(dep);
      newDeps[newDep] = newFiles;
    }
    deps = newDeps;

    files = {};

    const file = 'src/display/api.js';
    let source = addFile(file, initX, initY);
  }

  const importDeps2 = async () => {
    const data = await getData("/api/import");
    const deps = JSON.parse(data.deps);

    const files = {};
    const pos = {
      x: 40,
      y: 20,
      w: 100,
      h: 40,
    };

    for (let k of Object.keys(deps)){
      let v = deps[k];
      const sourceName = k.replace(/^\.\/src\//, '');
      const targets = Object.keys(v);
      if (targets.length>0) {
        let source;
        if (files[sourceName]) {
          source = files[sourceName];
        }
        else {
          console.log(sourceName);
          source = addBlock(sourceName, pos);
          files[sourceName] = source;
        }
  

        for (let targetName of targets){
          let target;
          if (files[targetName]) {
            target = files[targetName];
          }
          else {
            target = addBlock(targetName, pos);
            files[targetName] = target;
          }

          addLink(source, target);
        }
      }
    }
  }

  const getData = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    const res = await response.json();
    return res;
  }

  const postData = async (url, data) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    return res;
  }

  useEffect(()=>{
    const namespace = joint.shapes;

    const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

    var paper = new joint.dia.Paper({
        el: refDiv.current,
        model: graph,
        width: width,
        height: height,
        gridSize: 1,
        cellViewNamespace: namespace
    });

    setGraph(graph);
  }, []);

  const save = async ()=>{
    const jsonGraph = graph.toJSON();
    console.log("jsonGraph=", jsonGraph);
    const strGraph = JSON.stringify(jsonGraph);
    const res = await postData("/api/hello", {
      graph: strGraph
    });
    console.log("res = ", res);

  }
  const load = async ()=>{
    const data = await getData("/api/hello");
    const jsonGraph = JSON.parse(data.graph)
    graph.fromJSON(jsonGraph);
  }

  const test=()=>{

    var rect = new joint.shapes.standard.Rectangle();
    rect.position(100, 30);
    rect.resize(100, 40);
    rect.attr({
        body: {
            fill: 'blue'
        },
        label: {
            text: 'Hello\nworld\nthis is test',
            fill: 'white'
        }
    });
    rect.addTo(graph);

    var rect2 = rect.clone();
    rect2.translate(300, 0);
    rect2.resize(100, 80);
    rect2.attr('label/text', 'World111\nWorld222\nWorld333\nWorld444\nWorld555\n');
    rect2.addTo(graph);

    var link = new joint.shapes.standard.Link();
    link.source(rect);
    link.target(rect2);
    link.router('orthogonal');
    link.connector('rounded');
    link.addTo(graph);

    var rect3 = rect.clone();
    rect3.translate(400, 0);
    rect3.resize(100, 80);
    rect3.attr('label/text', 'Worldaaa\nWorldbbb\nWorldccc\nWorldddd\nWorldeee\n');
    rect3.addTo(graph);

    var link2 = new joint.shapes.standard.Link();
    link2.source(rect);
    link2.target(rect3);
    link2.router('orthogonal');
    link2.connector('rounded');
    link2.addTo(graph);


  }

  /*<div ref={refDiv2} className='overflow-scroll w-[800px] h-[600px] bg-green-200'>*/

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <p>count = {count}</p>
      <div className="join m-2">
        <button className="btn btn-primary mx-2" onClick={save}>Save</button>
        <button className="btn btn-primary mx-2" onClick={load}>Load</button>
        <button className="btn btn-primary mx-2" onClick={test}>Test</button>
        <button className="btn btn-primary mx-2" onClick={importDeps}>Import</button>
      </div>

      <div ref={refDiv2} className='overflow-scroll w-full h-[800px] bg-green-200'>
        <div ref={refDiv} className='bg-green-200'></div>
      </div>


    </main>
  )
}
