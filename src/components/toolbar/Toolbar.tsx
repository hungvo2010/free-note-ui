import clsx from "clsx";
import { useState } from "react";
import styles from "./Toolbar.module.scss";
var options = [
  "lock",
  "hand",
  "mouse",
  "rect",
  "diam",
  "circle",
  "arrow",
  "line",
  "pen",
  "word",
  "image",
  "eraser",
  "ai",
];
const Toolbar: React.FC = (props) => {
  const [selected, setSelected] = useState(0);
  return (
    <div className={clsx(styles.toolbar)}>
      <ul className={clsx(styles.toolLists)}>
        {options.map((option, index) => (
          <li
            key={index}
            onClick={() => setSelected(index)}
            className={clsx({
              [styles.selected]: index === selected,
            })}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Toolbar;
