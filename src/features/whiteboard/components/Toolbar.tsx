import clsx from "clsx";
import styles from "./Toolbar.module.scss";
import { useTheme } from "@shared/hooks/useTheme";
type ToolbarProps = {
  selected: number;
  handleSelected: (val: number) => void;
  options: string[];
};
const Toolbar: React.FC<ToolbarProps> = (props: ToolbarProps) => {
  const { theme, toggleTheme } = useTheme();

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
        <li onClick={toggleTheme} className={clsx(styles.themeToggle)}>
          {theme === "light" ? "🌙" : "☀️"}
        </li>
      </ul>
    </div>
  );
};

export default Toolbar;
