"use client"

import { useState, useRef, useEffect } from 'react'
import * as joint from 'jointjs';

export default function Home() {
  const [count, setCount] = useState(0)
  const [graph, setGraph] = useState(null)
  const refDiv = useRef();
  const refDiv2 = useRef();

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
        width: 1600,
        height: 1400,
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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      
      <div ref={refDiv2} className='overflow-scroll w-[800px] h-[600px] bg-green-200'>
        <div ref={refDiv} className='bg-green-200'></div>
      </div>
      

      <p>count = {count}</p>
      <div className="join m-2">
        <button className="btn btn-primary mx-2" onClick={save}>Save</button>
        <button className="btn btn-primary mx-2" onClick={load}>Load</button>
        <button className="btn btn-primary mx-2" onClick={test}>Test</button>
        <button className="btn btn-primary mx-2" onClick={()=>{setCount(count+1)}}>Test2</button>
      </div>


    </main>
  )
}
