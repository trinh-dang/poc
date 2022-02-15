$(document).ready(function () {
    let workflowId;
    let runId;

    $("#startBtn").click(function (event) {
        event.preventDefault();

        var model = monaco.editor.getModels()[0];
        var modelVal = model.getValue();

        $.ajax({
            type: 'POST',
            async: true,
            url: '/api/workflow/execute',
            data: modelVal,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                workflowId = response.workflowId;
                runId = response.runId;
                document.getElementById("results").innerHTML = JSON.stringify(response, undefined, 5);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $("#approveBtn").click(function (event) {
        event.preventDefault();

        if (!workflowId || !runId) {
            console.log('workflowId or runId is undefined');
            return;
        }

        $.ajax({
            type: 'POST',
            async: true,
            url: '/api/workflow/approve',
            data: JSON.stringify({ workflowId, runId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                document.getElementById("results").innerHTML = JSON.stringify(response, undefined, 5);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $("#rejectBtn").click(function (event) {
        event.preventDefault();

        if (!workflowId || !runId) {
            console.log('workflowId or runId is undefined');
            return;
        }

        $.ajax({
            type: 'POST',
            async: true,
            url: '/api/workflow/reject',
            data: JSON.stringify({ workflowId, runId }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                document.getElementById("results").innerHTML = JSON.stringify(response, undefined, 5);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $("#queryBtn").click(function (event) {
        event.preventDefault();

        if (!workflowId || !runId) {
            console.log('workflowId or runId is undefined');
            return;
        }

        $.ajax({
            type: 'GET',
            async: true,
            url: `/api/workflow/${workflowId}/${runId}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                document.getElementById("results").innerHTML = JSON.stringify(response, undefined, 5);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});

