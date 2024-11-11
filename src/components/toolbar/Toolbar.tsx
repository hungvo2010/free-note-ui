import clsx from "clsx";
import styles from "./Toolbar.module.scss";

type ToolbarProps = {
  selected: number;
  handleSelected: (val: number) => void;
  options: string[];
};
const Toolbar: React.FC<ToolbarProps> = (props: ToolbarProps) => {
  return (
    <div className={clsx(styles.toolbar)}>
      <ul className={clsx(styles.toolLists)}>
        {props.options.map((option, index) => (
          <li
            key={index}
            onClick={(e) => props.handleSelected(index)}
            className={clsx({
              [styles.selected]: index === props.selected,
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
