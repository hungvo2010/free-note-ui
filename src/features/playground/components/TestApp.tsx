import { useState } from "react";
import "./App.css";
import "./styles/global.scss";

type QuestionBoxProps = {
  item: { name: string; value: string };
};

const values: { name: string; value: string }[] = [
  {
    name: "state1",
    value: "state1",
  },
  {
    name: "state2",
    value: "state2",
  },
];

function QuestionBox({ item }: QuestionBoxProps) {
  const [counter, setCounter] = useState(0);

  return (
    <>
      <h1>{item.name}</h1>
      <p>{item.value}</p>
      <p>{counter}</p>
      <button onClick={() => setCounter(counter + 1)}> Increase counter</button>
    </>
  );
}

function TestApp() {
  const [click, setClick] = useState(0);
  console.log(click);
  return (
    <>
      <TestButton onClick={() => setClick(click + 1)} />
      <QuestionBox item={values[click % 2]} key={5} />
      <QuestionBox item={values[(click + 1) % 2]} key={click} />
    </>
  );
}

function TestButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <button onClick={onClick}>Click di </button>
    </>
  );
}

function ReUseComponent({ click }: { click: boolean }) {
  return click ? (
    <div>{/* <QuestionBox name="state1" value="state1" key="1" /> */}</div>
  ) : (
    <div>{/* <QuestionBox name="state2" value="state2" key="1" /> */}</div>
  );
}

export default TestApp;
