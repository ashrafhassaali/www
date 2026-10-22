// =================================
// Supabase Storage System
// =================================

const SUPABASE_URL = "https://xieyuppblcjyjpifeyhs.supabase.co";

// ضع هنا الـ Publishable Key الخاص بمشروعك
const SUPABASE_KEY = "sb_publishable_aluGOBotvJA7a2q8VQRvmw_65zBm-YC";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =================================
// تحويل من Database إلى التطبيق
// =================================

function fromDatabase(row) {
    return {
        id: Number(row.id),
        taskName: row.task_name || "",
        employee: row.employee || "",
        priority: row.priority || "High",
        start: row.start_time || "",
        end: row.end_time || "",
        status: row.status || "Pending"
    };
}


// =================================
// تحويل من التطبيق إلى Database
// =================================

function toDatabase(task) {
    return {
        id: Number(task.id),
        task_name: task.taskName || "",
        employee: task.employee || "",
        priority: task.priority || "High",
        start_time: task.start || null,
        end_time: task.end || null,
        status: task.status || "Pending"
    };
}


// =================================
// جلب المهام
// =================================

async function getTasks() {
    try {

        const { data, error } = await supabaseClient
            .from("tasks")
            .select("*")
            .order("id", {
                ascending: true
            });

        if (error) {
            console.error("خطأ في جلب المهام:", error);
            return [];
        }

        return (data || []).map(fromDatabase);

    } catch (error) {

        console.error("خطأ في الاتصال بقاعدة البيانات:", error);

        return [];
    }
}


// =================================
// حفظ المهام
// =================================

async function saveTasks(tasks) {
    try {

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return true;
        }

        const databaseTasks = tasks.map(toDatabase);

        const { error } = await supabaseClient
            .from("tasks")
            .upsert(databaseTasks, {
                onConflict: "id"
            });

        if (error) {
            console.error("خطأ في حفظ المهام:", error);
            return false;
        }

        return true;

    } catch (error) {

        console.error("خطأ في الحفظ:", error);

        return false;
    }
}


// =================================
// حذف جميع المهام
// =================================

async function clearTasks() {
    try {

        const { error } = await supabaseClient
            .from("tasks")
            .delete()
            .neq("id", 0);

        if (error) {
            console.error("خطأ في حذف المهام:", error);
            return false;
        }

        return true;

    } catch (error) {

        console.error("خطأ:", error);

        return false;
    }
}


// =================================
// تحديث مهمة
// =================================

async function updateStorageTask(updatedTask) {
    try {

        const { error } = await supabaseClient
            .from("tasks")
            .update(toDatabase(updatedTask))
            .eq("id", updatedTask.id);

        if (error) {
            console.error("خطأ في تحديث المهمة:", error);
            return false;
        }

        return true;

    } catch (error) {

        console.error("خطأ:", error);

        return false;
    }
}


// =================================
// حذف مهمة
// =================================

async function removeStorageTask(id) {
    try {

        const { error } = await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("خطأ في حذف المهمة:", error);
            return false;
        }

        return true;

    } catch (error) {

        console.error("خطأ:", error);

        return false;
    }
}


// =================================
// Trash - جلب المحذوفات
// =================================

async function getTrash() {
    try {

        const { data, error } = await supabaseClient
            .from("trash")
            .select("*")
            .order("id", {
                ascending: true
            });

        if (error) {
            console.error(
                "خطأ في قراءة سلة المحذوفات:",
                error
            );

            return [];
        }

        return (data || []).map(fromDatabase);

    } catch (error) {

        console.error(
            "خطأ في سلة المحذوفات:",
            error
        );

        return [];
    }
}


// =================================
// نقل المهمة إلى سلة المحذوفات
// =================================

async function moveToTrash(id) {

    try {

        const tasks = await getTasks();

        const deletedTask = tasks.find(
            task => task.id === Number(id)
        );

        if (!deletedTask) {
            console.error("المهمة غير موجودة:", id);
            return false;
        }


        // إضافة المهمة إلى Trash

        const { error: insertError } =
            await supabaseClient
                .from("trash")
                .upsert(
                    [toDatabase(deletedTask)],
                    {
                        onConflict: "id"
                    }
                );


        if (insertError) {

            console.error(
                "خطأ في نقل المهمة للسلة:",
                insertError
            );

            return false;
        }


        // حذف المهمة من Tasks

        const { error: deleteError } =
            await supabaseClient
                .from("tasks")
                .delete()
                .eq("id", id);


        if (deleteError) {

            console.error(
                "خطأ في حذف المهمة الأصلية:",
                deleteError
            );

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "خطأ في نقل المهمة:",
            error
        );

        return false;
    }
}


// =================================
// استرجاع المهمة من Trash
// =================================

async function restoreTask(id) {

    try {

        const trash = await getTrash();

        const task = trash.find(
            task => task.id === Number(id)
        );

        if (!task) {
            console.error("المهمة غير موجودة في السلة:", id);
            return false;
        }


        // إعادة المهمة إلى Tasks

        const { error: insertError } =
            await supabaseClient
                .from("tasks")
                .upsert(
                    [toDatabase(task)],
                    {
                        onConflict: "id"
                    }
                );


        if (insertError) {

            console.error(
                "خطأ في استرجاع المهمة:",
                insertError
            );

            return false;
        }


        // حذفها من Trash

        const { error: deleteError } =
            await supabaseClient
                .from("trash")
                .delete()
                .eq("id", id);


        if (deleteError) {

            console.error(
                "خطأ في حذف المهمة من السلة:",
                deleteError
            );

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "خطأ في الاسترجاع:",
            error
        );

        return false;
    }
}


// =================================
// حذف نهائي
// =================================

async function deleteForever(id) {

    try {

        const { error } =
            await supabaseClient
                .from("trash")
                .delete()
                .eq("id", id);

        if (error) {

            console.error(
                "خطأ في الحذف النهائي:",
                error
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "خطأ:",
            error
        );

        return false;
    }
}