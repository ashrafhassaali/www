// =================================
// Main Application - Supabase Version
// =================================

let editId = null;


// =================================
// عند تحميل الصفحة
// =================================

document.addEventListener("DOMContentLoaded", async function () {

    updateClock();

    setInterval(updateClock, 1000);

    // تحميل البيانات من Supabase
    await renderTasks();
    await renderTrash();
    await updateDashboard();


    // زر إضافة
    const addBtn =
        document.getElementById("addBtn");

    if (addBtn) {
        addBtn.addEventListener(
            "click",
            addTask
        );
    }


    // زر التعديل
    const updateBtn =
        document.getElementById("updateBtn");

    if (updateBtn) {
        updateBtn.addEventListener(
            "click",
            updateTask
        );
    }


    // البحث
    const search =
        document.getElementById("search");

    if (search) {
        search.addEventListener(
            "input",
            searchTasks
        );
    }

});


// =================================
// الساعة
// =================================

function updateClock() {

    const clock =
        document.getElementById("clock");

    if (!clock) {
        return;
    }

    const now = new Date();

    const date =
        now.toLocaleDateString("ar-EG");

    const time =
        now.toLocaleTimeString("ar-EG");

    clock.textContent =
        date + " - " + time;
}


// =================================
// إضافة مهمة
// =================================

async function addTask() {

    const taskName =
        document.getElementById("taskName")
            .value
            .trim();

    const employee =
        document.getElementById("employee")
            .value
            .trim();

    const priority =
        document.getElementById("priority")
            .value;

    const start =
        document.getElementById("start")
            .value;

    const end =
        document.getElementById("end")
            .value;


    if (taskName === "") {

        alert("اكتب اسم المهمة");

        return;
    }


    const task = {

        id: Date.now(),

        taskName: taskName,

        employee: employee,

        priority: priority,

        start: start,

        end: end,

        status: "Pending"
    };


    try {

        const result =
            await saveTasks([task]);


        if (!result) {

            alert(
                "حدث خطأ أثناء حفظ المهمة ❌"
            );

            return;
        }


        console.log(
            "تم حفظ المهمة:",
            task
        );


        await renderTasks();

        await updateDashboard();

        clearForm();


        alert(
            "تم إضافة المهمة بنجاح ✅"
        );


    } catch (error) {

        console.error(
            "خطأ في إضافة المهمة:",
            error
        );

        alert(
            "حدث خطأ أثناء إضافة المهمة ❌"
        );
    }

}


// =================================
// عرض المهام
// =================================

async function renderTasks() {

    const table =
        document.getElementById("taskTable");

    if (!table) {
        return;
    }


    table.innerHTML = "";


    let tasks =
        await getTasks();


    const now = new Date();

    let changed = false;


    // =================================
    // تحديث المهام المتأخرة
    // =================================

    tasks.forEach(task => {

        if (
            task.status !== "Completed" &&
            task.end &&
            new Date(task.end) < now
        ) {

            if (task.status !== "Overdue") {

                task.status = "Overdue";

                changed = true;
            }
        }

    });


    // حفظ الحالات الجديدة
    if (changed) {

        await saveTasks(tasks);

    }


    // =================================
    // عرض المهام
    // =================================

    tasks.forEach(task => {

        table.innerHTML += `

        <tr>

            <td>
                ${escapeHTML(task.taskName)}
            </td>

            <td>
                ${escapeHTML(task.employee)}
            </td>

            <td>
                <span class="priority ${String(task.priority).toLowerCase()}">
                    ${escapeHTML(task.priority)}
                </span>
            </td>

            <td>
                ${escapeHTML(task.start || "")}
            </td>

            <td>
                ${escapeHTML(task.end || "")}
            </td>

            <td>
                <span class="status ${String(task.status).toLowerCase()}">
                    ${escapeHTML(task.status)}
                </span>
            </td>

            <td>

                <button
                    onclick="toggleTaskStatus(${task.id})">
                    ✔️ حالة
                </button>

                <button
                    onclick="editTask(${task.id})">
                    ✏️ تعديل
                </button>

                <button
                    onclick="deleteTask(${task.id})">
                    🗑 حذف
                </button>

            </td>

        </tr>

        `;
    });

}


// =================================
// تغيير حالة المهمة
// =================================

async function toggleTaskStatus(id) {

    try {

        let tasks =
            await getTasks();


        tasks = tasks.map(task => {

            if (task.id === id) {

                if (
                    task.status === "Completed"
                ) {

                    task.status = "Pending";

                } else {

                    task.status = "Completed";
                }
            }

            return task;
        });


        const saved =
            await saveTasks(tasks);


        if (!saved) {

            alert(
                "حدث خطأ أثناء حفظ الحالة ❌"
            );

            return;
        }


        await renderTasks();

        await updateDashboard();


    } catch (error) {

        console.error(
            "خطأ في تغيير الحالة:",
            error
        );

        alert(
            "حدث خطأ ❌"
        );
    }

}


// =================================
// حذف المهمة
// =================================

async function deleteTask(id) {

    try {

        const moved =
            await moveToTrash(id);


        if (!moved) {

            alert(
                "حدث خطأ أثناء نقل المهمة للسلة ❌"
            );

            return;
        }


        await renderTasks();

        await renderTrash();

        await updateDashboard();


        alert(
            "تم نقل المهمة إلى سلة المحذوفات 🗑"
        );


    } catch (error) {

        console.error(
            "خطأ في حذف المهمة:",
            error
        );

        alert(
            "حدث خطأ أثناء الحذف ❌"
        );
    }

}


// =================================
// عرض سلة المحذوفات
// =================================

async function renderTrash() {

    const table =
        document.getElementById("trashTable");

    if (!table) {
        return;
    }


    table.innerHTML = "";


    const trash =
        await getTrash();


    trash.forEach(task => {

        table.innerHTML += `

        <tr>

            <td>
                ${escapeHTML(task.taskName)}
            </td>

            <td>
                ${escapeHTML(task.employee)}
            </td>

            <td>
                ${escapeHTML(task.priority)}
            </td>

            <td>
                ${escapeHTML(task.start || "")}
            </td>

            <td>
                ${escapeHTML(task.end || "")}
            </td>

            <td>

                <button
                    onclick="restoreDeletedTask(${task.id})">
                    ♻️ استرجاع
                </button>

                <button
                    onclick="deleteForeverTask(${task.id})">
                    ❌ حذف نهائي
                </button>

            </td>

        </tr>

        `;
    });

}


// =================================
// استرجاع من سلة المحذوفات
// =================================

async function restoreDeletedTask(id) {

    try {

        const restored =
            await restoreTask(id);


        if (!restored) {

            alert(
                "حدث خطأ أثناء استرجاع المهمة ❌"
            );

            return;
        }


        await renderTasks();

        await renderTrash();

        await updateDashboard();


        alert(
            "تم استرجاع المهمة ✅"
        );


    } catch (error) {

        console.error(
            "خطأ في الاسترجاع:",
            error
        );

        alert(
            "حدث خطأ ❌"
        );
    }

}


// =================================
// حذف نهائي
// =================================

async function deleteForeverTask(id) {

    try {

        const deleted =
            await deleteForever(id);


        if (!deleted) {

            alert(
                "حدث خطأ أثناء الحذف النهائي ❌"
            );

            return;
        }


        await renderTrash();


        alert(
            "تم حذف المهمة نهائيًا ❌"
        );


    } catch (error) {

        console.error(
            "خطأ في الحذف النهائي:",
            error
        );

        alert(
            "حدث خطأ ❌"
        );
    }

}


// =================================
// تعديل المهمة
// =================================

async function editTask(id) {

    try {

        const tasks =
            await getTasks();


        const task =
            tasks.find(
                task => task.id === id
            );


        if (!task) {

            alert(
                "المهمة غير موجودة"
            );

            return;
        }


        document.getElementById(
            "taskName"
        ).value = task.taskName;


        document.getElementById(
            "employee"
        ).value = task.employee;


        document.getElementById(
            "priority"
        ).value = task.priority;


        document.getElementById(
            "start"
        ).value = task.start;


        document.getElementById(
            "end"
        ).value = task.end;


        editId = id;


        document.getElementById(
            "addBtn"
        ).style.display = "none";


        document.getElementById(
            "updateBtn"
        ).style.display = "inline-block";


        // النزول إلى نموذج التعديل
        document.querySelector(
            ".addTask"
        )?.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "خطأ في تعديل المهمة:",
            error
        );

    }

}


// =================================
// حفظ التعديل
// =================================

async function updateTask() {

    if (editId === null) {
        return;
    }


    try {

        let tasks =
            await getTasks();


        tasks = tasks.map(task => {

            if (task.id === editId) {

                task.taskName =
                    document.getElementById(
                        "taskName"
                    ).value.trim();


                task.employee =
                    document.getElementById(
                        "employee"
                    ).value.trim();


                task.priority =
                    document.getElementById(
                        "priority"
                    ).value;


                task.start =
                    document.getElementById(
                        "start"
                    ).value;


                task.end =
                    document.getElementById(
                        "end"
                    ).value;
            }


            return task;

        });


        const saved =
            await saveTasks(tasks);


        if (!saved) {

            alert(
                "حدث خطأ أثناء حفظ التعديل ❌"
            );

            return;
        }


        editId = null;


        document.getElementById(
            "addBtn"
        ).style.display = "inline-block";


        document.getElementById(
            "updateBtn"
        ).style.display = "none";


        clearForm();


        await renderTasks();

        await updateDashboard();


        alert(
            "تم تعديل المهمة بنجاح ✅"
        );


    } catch (error) {

        console.error(
            "خطأ في تعديل المهمة:",
            error
        );

        alert(
            "حدث خطأ أثناء تعديل المهمة ❌"
        );
    }

}


// =================================
// تنظيف النموذج
// =================================

function clearForm() {

    document.getElementById(
        "taskName"
    ).value = "";


    document.getElementById(
        "employee"
    ).value = "";


    document.getElementById(
        "priority"
    ).value = "High";


    document.getElementById(
        "start"
    ).value = "";


    document.getElementById(
        "end"
    ).value = "";
}


// =================================
// البحث
// =================================

async function searchTasks() {

    const value =
        this.value
            .toLowerCase()
            .trim();


    const table =
        document.getElementById(
            "taskTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    const tasks =
        await getTasks();


    const filteredTasks =
        tasks.filter(task => {

            return (

                String(task.taskName)
                    .toLowerCase()
                    .includes(value)

                ||

                String(task.employee)
                    .toLowerCase()
                    .includes(value)

                ||

                String(task.priority)
                    .toLowerCase()
                    .includes(value)

                ||

                String(task.status)
                    .toLowerCase()
                    .includes(value)

            );

        });


    filteredTasks.forEach(task => {

        table.innerHTML += `

        <tr>

            <td>
                ${escapeHTML(task.taskName)}
            </td>

            <td>
                ${escapeHTML(task.employee)}
            </td>

            <td>
                <span class="priority ${String(task.priority).toLowerCase()}">
                    ${escapeHTML(task.priority)}
                </span>
            </td>

            <td>
                ${escapeHTML(task.start || "")}
            </td>

            <td>
                ${escapeHTML(task.end || "")}
            </td>

            <td>
                <span class="status ${String(task.status).toLowerCase()}">
                    ${escapeHTML(task.status)}
                </span>
            </td>

            <td>

                <button
                    onclick="toggleTaskStatus(${task.id})">
                    ✔️ حالة
                </button>

                <button
                    onclick="editTask(${task.id})">
                    ✏️ تعديل
                </button>

                <button
                    onclick="deleteTask(${task.id})">
                    🗑 حذف
                </button>

            </td>

        </tr>

        `;
    });

}


// =================================
// حماية عرض النصوص
// =================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}