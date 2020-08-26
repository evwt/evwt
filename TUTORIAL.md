# Tutorial - ToDo App

Let's build a todo app together!

## Prerequisites

Make sure you've followed the quick start instructions in the README first, reproduced below.

<details>
  <summary>
    <b>⌨️ Install EVWT</b>
  </summary>

  ```bash
  npm install -g @vue/cli
  vue create my-app
  cd my-app
  vue add evwt
  ```
</details>

For this app, we'll also add [element-ui](https://element.eleme.io/#/en-US/component/form) for their form components.

<details>
  <summary>
    <b>⌨️ Add Element UI</b>
  </summary>

  ```
    yarn add element-ui
  ```

  In main.js:
  ```js
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI, { size: 'small' });
  ```
</details>


## The Idea

A good app starts with a good plan. Here are the high level points of what we want to achieve:

- An editable list of todos for quick entry and editing
- A way to indicate if a todo is done
- Categories for grouping
- A way to filter out completed todos

## EvLayout

A good place to start is adding a layout to your app. Check out the [EVLayout playground](https://evwt-layout-playground.netlify.app) to get an idea of what's possible.

<img width="757" alt="Screen Shot 2020-08-17 at 6 49 13 PM" src="https://user-images.githubusercontent.com/611996/90455124-ca40ba80-e0ba-11ea-8a68-4f272ff0d63a.png">

For our app, [this layout](https://evwt-layout-playground.netlify.app/?direction=%22row%22&sizes=[%2232px%22,%221fr%22]&panes=[{name=%22toolbar%22&resizable=false},{direction=%22column%22&sizes=[%22250px%22,%221fr%22]&panes=[{minSize=250&direction=%22row%22&sizes=[%222fr%22,%221fr%22]&panes=[{name=%22categories%22},{name=%22tags%22}]},{name=%22main%22}]}]), pictured above, is a good start.

Edit your App.vue to use this layout:

<details>
  <summary>
    📄 <b>App.vue</b>
  </summary>

  ```vue
<template>
    <ev-layout :layout="layout">
      <template v-slot:toolbar>
        Toolbar
      </template>
      <template v-slot:categories>
        Categories
      </template>
      <template v-slot:tags>
        Tags
      </template>
      <template v-slot:main>
        Main
      </template>
    </ev-layout>
</template>

<script>
import { EvLayout } from 'evwt/components';

export default {
  components: {
    EvLayout
  },

  data() {
    return {
      layout: {
        direction: 'row',
        sizes: [
          '32px',
          '1fr'
        ],
        panes: [
          {
            name: 'toolbar',
            resizable: false
          },
          {
            direction: 'column',
            sizes: [
              '250px',
              '1fr'
            ],
            panes: [
              {
                minSize: 250,
                direction: 'row',
                sizes: [
                  '2fr',
                  '1fr'
                ],
                panes: [
                  {
                    name: 'categories'
                  },
                  {
                    name: 'tags'
                  }
                ]
              },
              {
                name: 'main'
              }
            ]
          }
        ]
      }
    };
  }
};
</script>

<style lang="scss">
html,
body {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
}

* {
  box-sizing: border-box;
  font-family: system-ui;
}

.ev-pane-toolbar {
    background: #dadada;
}

.ev-pane-categories {
    background: #e4e4e4;
}

.ev-pane-tags {
    background: #eee;
}
</style>
  ```
</details>

As you can see, EvLayout has created four slots for us based on our layout definition. In the following sections we will populate these slots with components we create.

## The List

### UI

Like any other Vue project, EVWT apps are made up of components. Let's create a new component, in `src/components`, for the list.

<details>
  <summary>
    📄 <b>TodoList.vue</b>
  </summary>

```vue
<template>
  <div class="todo-list">
    <div v-for="todo in todos" :key="todo.id" class="todo">
      <el-checkbox v-model="todo.done" type="checkbox" />
      <el-input v-model="todo.text" />
    </div>

    <el-input
      v-model="newTodo"
      class="todo-new"
      placeholder="New Todo"
      autofocus
      @keyup.enter.native="addNew" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTodo: '',
      todos: []
    };
  },

  created() {
    this.add('Clean fridge');
    this.add('Pet pets');
    this.add('Cancel Quibi account');
  },

  methods: {
    add(text) {
      this.todos.push({
        id: Math.random().toString().substr(2),
        text
      });
    },

    addNew() {
      this.add(this.newTodo);
      this.newTodo = '';
    }
  }
};
</script>

<style lang="scss">
// Give us a little padding around everything
.todo-list {
  padding: 15px;

  // Each todo item
  .todo {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  // Make our big round checkboxes
  .el-checkbox {
    width: 22px;
    height: 22px;

    .el-checkbox__input {
      cursor: default;
    }

    .el-checkbox__inner {
      width: 22px;
      height: 22px;
      border-radius: 100%;

      &:after {
        border-width: 2px;
        height: 12px;
        width: 4px;
        left: 7px;
        top: 2px;
      }
    }
  }

  // Make our underline-style text input
  .el-input {
    margin-left: 5px;

    .el-input__inner {
      padding: 0 5px ;
      border: 0;
      border-radius: 0;
      border-bottom: 1px solid #DCDFE6;
    }
  }

  // The New Todo input should line up with the others
  .el-input.todo-new {
    width: calc(100% - 28px);
    margin-left: 28px;
  }
}
</style>

```
</details>
<br>

It's a simple list of checkboxes/inputs with some CSS to make it look more like a todo list.

Now, just import and add the TodoList component to the App.vue component, in the `main` slot.

Here's what the app should look like now:
<br>
<img width="912" alt="Screen Shot 2020-08-17 at 9 48 21 PM" src="https://user-images.githubusercontent.com/611996/90464648-68d91580-e0d3-11ea-9911-ea8c4fe3f47d.png">
<br>
This is great and all, but it doesn't remember our todos when we quit and relaunch the app - let's fix that!

### EvStore

EVWT provides the [EvStore](https://evwt.net/#/EvStore) plugin for storing persistent data, just what we need to save our todos to disk.

To install it, make these additions to the following files:

<details>
  <summary>
    📄 <b>background.js</b>
  </summary>

```js
import { EvStore } from 'evwt/background';

EvStore.activate();
```
</details>

<details>
  <summary>
    📄 <b>main.js</b>
  </summary>

```js
import { EvStore } from 'evwt/plugins';

Vue.use(EvStore);
```
</details>

Now change the script section of your Vue component to this:

<details>
  <summary>
    📄 <b>App.vue</b>
  </summary>

```vue
<script>
export default {
  data() {
    return {
      newTodo: ''
      // removed todos[] here
    };
  },

  computed: {
    // Add computed property for store data
    todos() {
      return this.$evstore.store.todos;
    }
  },

  created() {
    // Initialize store if empty
    if (!this.$evstore.store.todos) {
      this.$evstore.store.todos = [];
    }
  },

  methods: {
    add(text) {
      this.todos.push({
        id: Math.random().toString().substr(2),
        text
      });
    },

    addNew() {
      this.add(this.newTodo);
      this.newTodo = '';
    }
  }
};
</script>
```
</details>

You'll notice that we:
- Replace the `todos` data property with a computed property that returns `this.$evstore.store.todos`.
- Initialize the todo store to an empty array if it doesn't exist.

And that's it for persistence! Quit and restart the app and you'll see the todos are saved.


## The Categories

Now that we have the basics of the todo list going, let's turn our attention to the list of categories.

### UI

We'll create another component in `src/components` for the categories:


<details>
  <summary>
    📄 <b>CategoryList.vue</b>
  </summary>

```vue
<template>
  <div class="category-list">
    <el-menu default-active="inbox">
      <el-menu-item index="inbox">
        <span>Inbox</span>
      </el-menu-item>

      <el-menu-item v-for="category in categories" :key="category.id" :index="category.id">
        <span>{{ category.name }}</span>
      </el-menu-item>
    </el-menu>

    <div v-if="showNewCategory" class="category-new">
      <el-input
        ref="categoryNew"
        v-model="newCategory"
        placeholder="New Category"
        @keyup.esc.native="hideNew"
        @keyup.enter.native="addNew" />
    </div>

    <el-link
      v-else
      class="category-add"
      icon="el-icon-plus"
      :underline="false"
      @click="showNew">
      Add Category
    </el-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNewCategory: false,
      newCategory: ''
    };
  },

  computed: {
    categories() {
      return this.$evstore.store.categories;
    }
  },

  created() {
    if (!this.$evstore.store.categories) {
      this.$evstore.store.categories = [];
    }
  },

  methods: {
    add(name) {
      this.categories.push({
        id: Math.random().toString().substr(2),
        name
      });
    },

    async showNew() {
      this.showNewCategory = true;
      await this.$nextTick();
      this.$refs.categoryNew.$el.querySelector('input').focus();
    },

    hideNew() {
      this.showNewCategory = false;
    },

    addNew() {
      this.add(this.newCategory);
      this.newCategory = '';
      this.showNew = false;
    }
  }
};
</script>

<style lang="scss">
.category-list {
  height: 100%;
  border-right: 1px solid #e6e6e6;

  .el-link {
    height: 36px;
    justify-content: flex-start;
    background: #fff;
    display: flex;
    padding-left: 18px;
    font-weight: normal;

    .el-icon-plus {
      margin-right: 4px;
    }
  }

  .el-menu {
    height: calc(100% - 36px);
    border-right: 0;
  }

  .el-menu-item {
    height: auto;
    line-height: 38px;

    span {
      vertical-align: baseline;
    }
  }

  .el-menu-item {
    color: #606266;
  }

  .category-new {
    padding: 0 5px;
  }
}
</style>
```
</details>

As you can see we've used EvStore to persist the list of categories just like we did with the list of todos.

This brings our UI to this:

<img width="912" alt="Screen Shot 2020-08-18 at 6 28 27 PM" src="https://user-images.githubusercontent.com/611996/90575253-a051cb80-e180-11ea-948e-8f5b391dfaa1.png">

### EvMenu

Now is a good time to introduce [EvMenu](https://evwt.net/#/EvMenu). We'll want to add some items to the application menu for adding a todo/category. We also could use some context menus for managing todos/categories.

Create a file `src/menu.js` with these contents:

<details>
  <summary>
    📄 <b>menu.js</b>
  </summary>

```js
const isMac = process.platform === 'darwin';

const menu = [
  {
    label: 'File',
    id: 'file',
    submenu: [
      {
        id: 'new-todo',
        accelerator: 'CmdOrCtrl+N',
        label: 'New Todo'
      },
      {
        id: 'new-category',
        accelerator: 'CmdOrCtrl+Shift+N',
        label: 'New Category'
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    id: 'edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      ...(isMac ? [
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [])
    ]
  },
  {
    label: 'View',
    id: 'view',
    submenu: [
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' }
    ]
  },
  {
    label: 'Window',
    id: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  }
];

if (isMac) {
  menu.unshift({ role: 'appMenu' });
}

export default menu;
```
</details>

This is a basic Electron [menu definition](https://www.electronjs.org/docs/api/menu#main-process), with two items added to the file menu, one for adding a new todo and another for adding a new category.

Next, make these additions to the following files, to use this menu definition with EvMenu:

<details>
  <summary>
    📄 <b>background.js</b>
  </summary>

```js
import { EvMenu } from 'evwt/background';

EvMenu.activate();

// Add this line right after creating the window (around line 27)
// EvMenu.attach(win);
```
</details>

<details>
  <summary>
    📄 <b>main.js</b>
  </summary>

```js
import { EvMenu } from 'evwt/plugins';
import menu from './menu';

Vue.use(EvMenu, menu);
```
</details>

You should now see two new items in the main menu:

<img width="206" alt="Screen Shot 2020-08-18 at 3 04 27 PM" src="https://user-images.githubusercontent.com/611996/90560044-214e9a00-e164-11ea-83fd-079482e48c22.png">

To respond to input on native menus, we use `this.$evmenu.$on('input:<id>')`, so let's update these two files:

<details>
  <summary>
    📄 <b>TodoList.vue</b>
  </summary>

```js
// Add `ref="todoNew"` to the new todo input, then this in created():
this.$evmenu.$on('input:new-todo', () => {
  this.$refs.todoNew.$refs.input.focus();
});
```
</details>

<details>
  <summary>
    📄 <b>CategoryList.vue</b>
  </summary>

```js
// Add this to created()
this.$evmenu.$on('input:new-category', () => {
  this.showNew();
});
```
</details>


### Logic

We need to link together the list of categories with the list of todos.