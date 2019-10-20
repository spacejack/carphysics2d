toggleSidebar = function() {
    document.getElementById("menu").classList.toggle('active');
    SIDEBAR_OPEN = !SIDEBAR_OPEN;
    if (SIDEBAR_OPEN) {
        PAUSE = true;
    } else {
        PAUSE = false;
        App.resume();
    }
}

toggleSidebarDontResume = function() {
    document.getElementById("menu").classList.toggle('active');
    SIDEBAR_OPEN = !SIDEBAR_OPEN;
    if (SIDEBAR_OPEN) {
        PAUSE = true;
    } else {
        PAUSE = false;
    }
}