document.addEventListener("DOMContentLoaded", function (event) {
  document.querySelector(".loading_group").style.display = "none";
});
const draw = () => {
  //cache dom elements
  // layout
  const background_container = document.querySelector("#canvas_div");
  const button_color = document.querySelectorAll(".button");
  // forms
  const number_input_form = document.getElementById("form");
  const error_messages = document.getElementById("errors");
  const user_input_form = document.getElementById("form2");
  const canvas = document.getElementById("main_canvas");

  // forms label and inputs
  const form_inputs = document.querySelectorAll(".input");

  // feedback
  const main_message = document.getElementById("message");
  const speed_up = document.getElementById("speed_up");

  // setting_buttons
  const slow_down = document.getElementById("slow_down");
  const color_blind_button = document.getElementById("colorblind");
  const pause_button = document.getElementById("pause");
  const reset_button = document.getElementById("reset");

  //setting dropdown button
  const menu_display_button = document.querySelector(".settings_button");
  const menu_options = document.querySelector(".settings_div");
  const gear_icon = document.querySelector(".settings_icon");

  // sort option buttons
  const bubble_button = document.getElementById("bubble_button");
  const selection_button = document.getElementById("selection_button");
  const insertion_button = document.getElementById("insertion_button");

  // sort dropdown button
  const sorts_display_button = document.querySelector(".sorts_display_button");
  const sorts_options = document.querySelector("#sort_options_container");
  const sorts_arrow = document.querySelector(".sort_arrow");
  const sorts_text = document.querySelector(".sorts_select_text");

  const dark_theme = {
    button_background: "white",
    button_color: "black",
    background: "black",
    background_text: "white",
  };

  const light_theme = {
    button_background: "black",
    button_color: "white",
    background: "white",
    background_text: "black",
  };

  const box_colors_original = {
    larger: "#FE0000",
    smaller: "#0E21A0",
    sorted: "#FFE5AD",
    default: "#1B9C85",
    scanning: " red",
  };

  // the color of the box being passed over on swap
  const lower_opacity = "rgba(128, 128, 128,.5)";

  //larger,smaller,sorted,on creation
  const box_colors_cb = {
    larger: "#FE0000",
    smaller: "#0E21A0",
    sorted: "#FFE5AD",
    default: "white",
    scanning: "bubble_button",
  };

  //public elements
  let arr = [];
  let selection_made = false;
  let selection_choice = "";
  const DEFAULT_SPEED = 2;
  let dx = DEFAULT_SPEED;
  let reset_scheduled = false;

  //browser compatability check
  if (canvas.getContext) {
    //----------------------inner(if scope) variables----------------------
    const inner_height = canvas.height;
    const inner_width = canvas.width;
    const y_height = inner_height - 20; // (inner_height / 2)
    const start_x = 10;
    const GAP = 2;
    const ctx = canvas.getContext("2d");
    const min_length = 2;
    let cb_mode = false;
    /*---------------------- form label events----------------------*/

    form_inputs.forEach((input) => {
      input.addEventListener("click", () => {
        input.parentElement.classList.toggle("label_active");
      });
    });

    /*---------------------- dropdown events ----------------------*/
    sorts_display_button.addEventListener("click", () => {
      sorts_options.classList.toggle("active");
      sorts_arrow.classList.toggle("active");
    });

    menu_display_button.addEventListener("click", () => {
      menu_options.classList.toggle("active");
      gear_icon.classList.toggle("active");
    });

    /*---------------------- Button methods ----------------------*/
    const error_message = (err_no) => {
      if (err_no === "sorting") {
        error_messages.innerHTML = "Already Sorting!";
        setTimeout(() => {
          error_messages.innerHTML = " ";
        }, 2000);
      } else if (err_no === "empty") {
        error_messages.innerHTML = "Minimum of 2 items!";
        setTimeout(() => {
          error_messages.innerHTML = " ";
        }, 2000);
      }
    };

    const sort_called = (sort_name) => {
      if (!selection_made && arr.length >= min_length) {
        selection_made = true;
        requestAnimationFrame(sort_name);
      } else if (arr.length < min_length) {
        error_message("empty");
      } else {
        error_message("sorting");
      }
    };

    /*---------------------- Form calls ----------------------*/
    number_input_form.addEventListener("submit", () => {
      const num = number_input_form[0].value;
      if (selection_made) {
        error_message("sorting");
      } else {
        ctx.clearRect(0, 0, inner_width, inner_height);
        main_message.innerHTML = "Lets Sort!";
        arr = create_items(num);
        printAll();
      }
    });
    user_input_form.addEventListener("submit", () => {
      let temp_array = [];
      const string = user_input_form[0].value;
      temp_array = string.split(",");
      //cast to number from text
      for (let i = 0; i < temp_array.length; ++i)
        temp_array[i] = Number(temp_array[i]);

      if (selection_made) {
        error_message("sorting");
      } else {
        ctx.clearRect(0, 0, inner_width, inner_height);
        main_message.innerHTML = "Lets Sort!";
        arr = create_user_array(temp_array);
        printAll();
      }
    });

    /*---------------------- Top Buttons ----------------------*/
    const changeTheme = (button_style, background_color, background_text) => {
      cb_mode = !cb_mode;

      for (let i = 0; i < button_color.length; ++i)
        button_color[i].style = button_style;
      background_container.style.background = background_color;
      background_container.style.color = background_text;
    };

    color_blind_button.addEventListener("click", () => {
      const light_theme_button_styles = `
            background-color: ${light_theme.button_background};
            color:${light_theme.button_color};
            `;
      const dark_theme_button_styles = `
            background-color:${dark_theme.button_background};
            color:${dark_theme.button_color};
            `;
      if (!cb_mode) {
        changeTheme(
          light_theme_button_styles,
          light_theme.background,
          light_theme.background_text
        );
      } else {
        changeTheme(
          dark_theme_button_styles,
          dark_theme.background,
          dark_theme.background_text
        );
      }
    });

    const updateSpeedMessage = (text) => {
      error_messages.innerHTML = text;
      setTimeout(() => {
        error_messages.innerHTML = "";
      }, 2000);
    };
    const speed_options = {
      0: "Paused",
      1: "Min",
      2: "Slow",
      3: "Normal",
      4: "Faster",
      5: "Max",
    };
    slow_down.addEventListener("click", () => {
      if (dx <= 1) {
        return;
      }
      dx--;
      if (dx <= 1) {
        slow_down.classList.add("disabled");
      }
      if (speed_up.classList.contains("disabled")) {
        speed_up.classList.remove("disabled");
      }
      update_speed(dx);
      updateSpeedMessage(speed_options[dx]);
    });

    speed_up.addEventListener("click", () => {
      if (dx >= 5) return;
      dx++;
      if (dx >= 5) {
        speed_up.classList.add("disabled");
      }
      if (slow_down.classList.contains("disabled")) {
        slow_down.classList.remove("disabled");
      }
      update_speed(dx);
      updateSpeedMessage(speed_options[dx]);
    });

    pause_button.addEventListener("click", () => {
      dx = dx === 0 ? DEFAULT_SPEED : 0;

      if (speed_up.classList.contains("disabled")) {
        speed_up.classList.remove("disabled");
      }
      if (!slow_down.classList.contains("disabled")) {
        slow_down.classList.add("disabled");
      }
      update_speed(dx);
      updateSpeedMessage(speed_options[dx]);
    });

    /*---------------------- Sorting Buttons ----------------------*/

    const sort_selection_made = (text) => {
      sorts_options.classList.toggle("active");
      sorts_arrow.classList.toggle("active");
      switch (text) {
        case "Bubble":
          bubble_button.classList.add("disabled");
          break;
        case "Selection":
          selection_button.classList.add("disabled");
          break;
        case "Insertion":
          insertion_button.classList.add("disabled");
          break;
        default:
          break;
      }

      switch (selection_choice) {
        case text:
          break;
        case "Bubble":
          bubble_button.classList.remove("disabled");
          break;
        case "Selection":
          selection_button.classList.remove("disabled");
          break;
        case "Insertion":
          insertion_button.classList.remove("disabled");
          break;
        default:
          break;
      }

      selection_choice = text;
      sorts_text.innerHTML = text;
    };
    bubble_button.addEventListener("click", () => {
      sort_selection_made("Bubble");
      sort_called(bubble_sort);
    });

    insertion_button.addEventListener("click", () => {
      sort_selection_made("Insertion");

      sort_called(insertion_sort);
    });
    selection_button.addEventListener("click", () => {
      sort_selection_made("Selection");
      sort_called(selection_sort);
    });

    /*---------------------- Reset ----------------------*/
    reset_button.addEventListener("click", () => {
      if (!selection_made) {
        reset();
      } else {
        reset_scheduled = true;
      }
    });

    const reset = () => {
      dx = DEFAULT_SPEED;
      update_speed(dx);
      main_message.innerHTML = "Add items to begin!";
      shuffleArray();
      ctx.clearRect(0, 0, inner_width, inner_height);
      reset_all_colors();
      printAll();
    };

    /*---------------------- Box Class Declaration ---------------------- */
    class box {
      constructor(
        x,
        y,
        width = 20,
        height = 60,
        color = box_colors_original["default"]
      ) {
        this.x = x;
        //uses glbal var for listener
        this.dx = dx;
        this.y = y;
        this.width = width;
        this.height = height;
        if (cb_mode) this.color = box_colors_cb["default"];
        else {
          this.color = color;
        }
      }
      create_box = () => {
        ctx.fillStyle = this.color;
        ctx.fillText(`${this.height}`, this.x + GAP, y_height + 10, [
          this.width - GAP,
        ]);
        ctx.globalAlpha = this.globalAlpha;
        if (this.x + this.width >= inner_width) {
          const temp_width = Math.floor(Math.random() * (inner_width - this.x));
          ctx.fillRect(this.x, this.y, temp_width, 0);
        } else if (y_height - this.y < 0) {
          //fix this for the array
          ctx.fillRect(this.x, this.y, this.width, 0);
        } else {
          ctx.fillRect(this.x, this.y, this.width, -this.height);
        }
      };
      update = (new_x) => {
        if (new_x > this.x) {
          this.x =
            this.x + this.dx > new_x
              ? this.x + (new_x - this.x)
              : this.x + this.dx;
          return false;
        } else if (this.x > new_x) {
          this.x = this.x - this.dx < 0 ? 0 : this.x - this.dx;
          return false;
        } else {
          return true;
        }
      };
    }

    /*---------------------- Generates Array ---------------------- */
    const generate_num_y = () => {
      minimum = inner_height / 20;
      maximum = y_height - 30;
      min = Math.ceil(minimum);
      max = Math.floor(maximum);
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const create_items = (amount_boxes) => {
      const array = [];
      const PREFERRED_WIDTH = 25;
      let current_x = start_x;
      const pixel_remaining = inner_width - start_x * 2;
      const gap_space = amount_boxes * GAP;

      //DO NOT MAKE IT A DOUBLE or we crash..
      let box_width;
      if (
        amount_boxes * PREFERRED_WIDTH + amount_boxes * GAP >
        pixel_remaining
      ) {
        box_width = Math.floor((pixel_remaining - gap_space) / amount_boxes);
        //we add empty space since using floor leaves big gaps in the case of larger number of boxes
        const empty_space =
          (pixel_remaining - (box_width * amount_boxes + gap_space)) /
          amount_boxes;
        box_width += empty_space;
      } else {
        box_width = PREFERRED_WIDTH;
      }
      for (let i = 0; i < amount_boxes; ++i) {
        const temp_height = generate_num_y();
        array.push(new box(current_x, y_height, box_width, temp_height));
        current_x += box_width + GAP;
        array[i].create_box();
      }
      return array;
    };

    const create_user_array = (array) => {
      const length = array.length;
      const return_array = [];
      const BOX_WIDTH = 25;
      let current_x = start_x;
      const max_height = y_height - 30;
      //Only finite amount of user boxes allowed so no need to calculate
      for (let i = 0; i < length; ++i) {
        if (array[i] > max_height) {
          array[i] = max_height;
          main_message.innerHTML = `Max height of ${max_height} allowed. `;
        }
        return_array.push(new box(current_x, y_height, BOX_WIDTH, array[i]));
        current_x += BOX_WIDTH + GAP;
        return_array[i].create_box();
      }
      return return_array;
    };

    /*---------------------- Sort Helper Methods ---------------------- */
    const update_speed = (new_dx) => {
      for (let i = 0; i < arr.length; ++i) {
        arr[i].dx = new_dx;
      }
    };
    function shuffleArray() {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i].x, arr[j].x] = [arr[j].x, arr[i].x];
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    const printAll = () => {
      for (let i = 0; i < arr.length; ++i) {
        arr[i].create_box();
      }
    };
    const reset_all_colors = () => {
      if (!cb_mode) {
        for (let i = 0; i < arr.length; ++i) {
          arr[i].color = box_colors_original["default"];
        }
      } else {
        for (let i = 0; i < arr.length; ++i) {
          arr[i].color = box_colors_cb["default"];
        }
      }
    };
    const reduce_opacity = (start, end) => {
      if (start === arr.length - 1) return;
      for (let i = start + 1; i < end; ++i) {
        arr[i].color = lower_opacity;
      }
    };
    const sorted_section = (start, end) => {
      if (!cb_mode) {
        for (let i = start; i < end; ++i) {
          arr[i].color = box_colors_original["sorted"];
        }
      } else {
        for (let i = start; i < end; ++i) {
          arr[i].color = box_colors_cb["sorted"];
        }
      }
    };

    const exit_sort = (loop, end_time) => {
      ctx.clearRect(0, 0, inner_width, inner_height);
      sorted_section(0, loop);
      printAll();
      selection_made = false;
      main_message.innerHTML = `Sorted in: ${end_time / 1000}s`;
    };

    const update_arr = (first, second) => {
      const temp = arr[first];
      arr[first] = arr[second];
      arr[second] = temp;
    };

    const color_boxes = (smaller, bigger, sorted_end, sorted_beginning = 0) => {
      //clear canvas
      ctx.clearRect(0, 0, inner_width, inner_height);
      //update box positions and color
      sorted_section(sorted_beginning, sorted_end);
      if (!cb_mode) {
        arr[bigger].color = box_colors_original["larger"];
        arr[smaller].color = box_colors_original["smaller"];
      } else {
        arr[bigger].color = box_colors_cb["larger"];
        arr[smaller].color = box_colors_cb["smaller"];
      }
    };

    const set_scanning_color = (index, s_start, s_end) => {
      sorted_section(s_start, s_end);
      if (!cb_mode) arr[index].color = box_colors_original["scanning"];
      else {
        arr[index].color = box_colors_cb["scanning"];
      }
      ctx.clearRect(0, 0, inner_width, inner_height);
      printAll();
    };

    /*---------------------- Bubble sort ---------------------- */
    function bubble_sort() {
      //make it run in a loop and swap at each change.
      let index = 0;
      let inSwap = false; //means we are currently swapping
      let larger_x; //x coordinates of bigger box;
      let loop = 0;
      let animation_time;
      let total_animation_time = 0;
      let end = arr.length - 1;
      const start = Date.now();

      //check if current comparison is a swap
      function main() {
        reset_all_colors();
        if (!inSwap) {
          if (reset_scheduled) {
            selection_made = false;
            reset_scheduled = false;
            reset();
            return;
          }
          check_if_swap();
        }
        //animate current swap
        if (inSwap) {
          main_message.innerHTML = `Swapping ${arr[index].height} with ${
            arr[index + 1].height
          }!`;
          //update boxes
          color_boxes(index + 1, index, arr.length, arr.length - loop);
          let t1 = arr[index].update(larger_x + arr[index + 1].width + GAP);
          let t2 = arr[index + 1].update(larger_x);
          //repaint canvas
          printAll();
          //check if done with box swap
          inSwap = t1 && t2 ? false : true;
          if (!inSwap) {
            total_animation_time += Date.now() - animation_time;
            animation_time = 0;
            update_arr(index, index + 1);
            index = index === arr.length - 2 ? 0 : index + 1;
            if (index === 0) loop++;
          }
        }

        function check_if_swap() {
          if (index === end) {
            index = 0;
            end--;
            loop++;
          } else if (arr[index].height > arr[index + 1].height) {
            inSwap = true;
            larger_x = arr[index].x;
            animation_time = Date.now();
          } else {
            set_scanning_color(index, arr.length - loop, arr.length);
            index++;
          }
        }
        if (loop === arr.length - 1) {
          const end_time = Date.now() - (start + total_animation_time);
          exit_sort(loop + 1, end_time);
          return;
        }
        requestAnimationFrame(main);
      }

      main();
    }

    /*---------------------- Selection sort ---------------------- */
    function selection_sort() {
      //make it run in a loop and swap at each change.
      let index = 0;
      let inSwap = false; //means we are currently swapping
      let larger_x; //x coordinates of bigger box;
      let smaller_x;
      //let done =false; //if the current inSw
      let loop = 0;
      let smallest = 0;
      let animation_time;
      let total_animation_time = 0;
      const start = Date.now();

      //the condition change is that we only swap the smallest once
      function main() {
        reset_all_colors();
        if (!inSwap) {
          if (reset_scheduled) {
            selection_made = false;
            reset_scheduled = false;
            reset();
            return;
          }
          check_if_swap();
        }
        //animate current swap
        if (inSwap) {
          main_message.innerHTML = `Swapping ${arr[smallest].height} with ${arr[loop].height}!`;
          //update boxes
          color_boxes(smallest, loop, loop);
          reduce_opacity(loop, smallest);
          let t1 = arr[smallest].update(larger_x);
          let t2 = arr[loop].update(smaller_x);
          //repaint canvas
          printAll();
          //check if done with box swap
          inSwap = t1 && t2 ? false : true;
          if (!inSwap) {
            total_animation_time += Date.now() - animation_time;
            animation_time = 0;
            update_arr(loop, smallest);
            loop++;
            index = loop;
            smallest = loop;
          }
        }

        function check_if_swap() {
          //check if the whole array has been scanned
          if (
            index === arr.length - 1 ||
            arr[index].height < arr[smallest].height
          ) {
            if (arr[index].height < arr[smallest].height) {
              smallest = index;
            }
            if (index === arr.length - 1) {
              inSwap = true;
              larger_x = arr[loop].x;
              smaller_x = arr[smallest].x;
              animation_time = Date.now();
            }
          } else {
            set_scanning_color(index, 0, loop);
            index = index + 1;
          }
        }
        if (loop === arr.length - 1) {
          const end_time = Date.now() - (start + total_animation_time);
          exit_sort(loop + 1, end_time);
          return;
        }
        requestAnimationFrame(main);
      }
      main();
    }

    /*---------------------- Insertion sort ---------------------- */
    function insertion_sort() {
      //make it run in a loop and swap at each change.
      let index = 1;
      let inSwap = false; //means we are currently swapping
      let larger_x; //x coordinates of bigger box;
      //let done =false; //if the current inSw
      let loop = 1;
      let animation_time;
      let total_animation_time = 0;
      const start = Date.now();

      //check if current comparison is a swap
      function main() {
        reset_all_colors();
        if (!inSwap) {
          if (reset_scheduled) {
            selection_made = false;
            reset_scheduled = false;
            reset();
            return;
          }
          check_if_swap();
        }
        //animate current swap
        if (inSwap) {
          main_message.innerHTML = `Swapping ${arr[index].height} with ${
            arr[index - 1].height
          }!`;
          //update boxes
          color_boxes(index, index - 1, loop);
          let t1 = arr[index].update(larger_x);
          let t2 = arr[index - 1].update(larger_x + arr[index].width + GAP);
          //repaint canvas
          printAll();
          //check if done with box swap
          inSwap = t1 && t2 ? false : true;
          if (!inSwap) {
            total_animation_time += Date.now() - animation_time;
            animation_time = 0;
            update_arr(index, index - 1);
            index--;
            if (index <= 0) {
              loop++;
              index = loop;
            }
          }
        }
        function check_if_swap() {
          if (arr[index].height < arr[index - 1].height) {
            inSwap = true;
            larger_x = arr[index - 1].x;
            animation_time = Date.now();
          } else {
            index--;
            set_scanning_color(index, 0, loop);
            if (index <= 0) {
              loop++;
              index = loop;
            }
          }
        }
        if (loop === arr.length) {
          const end_time = Date.now() - (start + total_animation_time);
          exit_sort(loop, end_time);
          return;
        }
        requestAnimationFrame(main);
      }
      main();
    }
    /*END*/
  } else {
    //canvas not supported by browser
    window.alert("canvas not supported by your browser");
  }
};
