document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------
       Sidebar toggle — collapses on desktop, slides over on mobile
       ------------------------------------------------------ */
    var toggleBtn = document.getElementById('sidebarToggle');
    var backdrop = document.getElementById('hmsSidebarBackdrop');
    var body = document.body;

    function isMobile() {
        return window.innerWidth < 992;
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            if (isMobile()) {
                body.classList.toggle('sidebar-open');
            } else {
                body.classList.toggle('sidebar-collapsed');
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function () {
            body.classList.remove('sidebar-open');
        });
    }

    window.addEventListener('resize', function () {
        if (!isMobile()) {
            body.classList.remove('sidebar-open');
        }
    });

    /* ------------------------------------------------------
       Auto-dismiss flash alerts after 5 seconds
       ------------------------------------------------------ */
    document.querySelectorAll('.hms-alert-auto').forEach(function (alertEl) {
        setTimeout(function () {
            var bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
            bsAlert.close();
        }, 5000);
    });

    /* ------------------------------------------------------
       Confirm before destructive actions (delete forms/buttons)
       ------------------------------------------------------ */
    document.querySelectorAll('[data-confirm]').forEach(function (el) {
        el.addEventListener('submit', function (e) {
            var message = el.getAttribute('data-confirm') || 'Are you sure?';
            if (!window.confirm(message)) {
                e.preventDefault();
            }
        });
    });

    /* ------------------------------------------------------
       Enable Bootstrap tooltips where present
       ------------------------------------------------------ */
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        new bootstrap.Tooltip(el);
    });

});
