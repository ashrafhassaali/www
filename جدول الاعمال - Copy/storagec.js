```javascript
console.log("STORAGE JS LOADED");

function getTasks() {
    console.log("getTasks يعمل");
    return [];
}

async function saveTasks(tasks) {
    console.log("saveTasks يعمل", tasks);
    return true;
}

async function getTrash() {
    return [];
}

async function moveToTrash(id) {
    return true;
}

async function restoreTask(id) {
    return true;
}

async function deleteForever(id) {
    return true;
}

async function updateStorageTask(task) {
    return true;
}

async function removeStorageTask(id) {
    return true;
}
```
