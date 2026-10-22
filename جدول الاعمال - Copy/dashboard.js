// =================================
// Dashboard System - Supabase
// =================================

async function updateDashboard() {

    const tasks =
        await getTasks();


    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.status === "Completed"
        ).length;


    const pending =
        tasks.filter(
            task => task.status === "Pending"
        ).length;


    const overdue =
        tasks.filter(
            task => task.status === "Overdue"
        ).length;


    const totalElement =
        document.getElementById(
            "totalTask"
        );


    const completedElement =
        document.getElementById(
            "completedTask"
        );


    const pendingElement =
        document.getElementById(
            "pendingTask"
        );


    const lateElement =
        document.getElementById(
            "lateTask"
        );


    if (totalElement) {
        totalElement.textContent =
            total;
    }


    if (completedElement) {
        completedElement.textContent =
            completed;
    }


    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }


    if (lateElement) {
        lateElement.textContent =
            overdue;
    }


    // =================================
    // نسبة الإنجاز
    // =================================

    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );
    }


    const progressElement =
        document.getElementById(
            "progress"
        );


    if (progressElement) {

        progressElement.style.width =
            progress + "%";
    }

}