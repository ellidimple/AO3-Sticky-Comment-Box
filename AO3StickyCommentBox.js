// ==UserScript==
// @name         Elli's Floating Ao3 Comment Box
// @namespace    http://tampermonkey.net/
// @version      2025-08-22_generic_create_element_fcn
// @description  Floating menu and comment box. Mobile friendly!
// @author       ellidimple
// @match        https://archiveofourown.org/works/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     style https://raw.githubusercontent.com/ellidimple/AO3-Sticky-Comment-Box/refs/heads/Initial/style.css
// ==/UserScript==

function stickyElement(element, summaryText, edge) {
    const sticky = document.createElement("details");
    const summary = document.createElement("summary");
    summary.innerText = summaryText;

    sticky.classList.add("stickyMenu", `sticky_${edge}`, "javascript");
    sticky.append(summary);
    // element.classList.add("javascript");
    element.insertAdjacentElement("afterend",sticky);
    sticky.append(element);

    return sticky;
}

function retriveComment(url, workNum) {

    const existingComment = GM_getValue(url);
    const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
    if (existingComment) {
        commentTextArea.value = existingComment;
    }
}

function stickyNavigation() {
    //         sticky the navigation
    const work_navigation = document.querySelector("ul.work.navigation.actions");
    work_navigation.id = "workNavigation";
    stickyElement(work_navigation, "📔", "top");
}

function stickyComment() {
    const comment = document.getElementById("add_comment_placeholder");
    const sticky = stickyElement(comment, "💬", "bottom");
    const feedback = document.getElementById("feedback");
    feedback.insertAdjacentElement("beforebegin", sticky);
}

// function createSaveComment() {
//     const saveComment = document.createElement("input");
//     saveComment.id = "saveComment";
//     saveComment.type = "button";
//     saveComment.value = "Save for later";
//     return saveComment;
// }

function createElement(type, attributes) {
    const input = document.createElement("input");
    attributes.forEach(function ([name, value]) {
        input.setAttribute(name, value);
    });
    return input;
}

function createCommentNavigation(url, workNum) {
    const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
    const submitComment = document.getElementById(`comment_submit_for_${workNum}`);
    const submitContainer = submitComment.parentElement;
    const comment_actions = document.createElement("ul");

    comment_actions.classList.add("work", "navigation", "actions");

    // const saveComment = createSaveComment();
    const saveComment = createElement("input", [
        ["id", "saveComment"],
        ["type", "button"],
        ["value", "Save for later"]
    ]);

    saveComment.addEventListener("mouseup", function(){
        const commentText = commentTextArea.value;
        if (commentText && commentText.length > 0) {
            GM_setValue(url, commentText);
        }
    });

    [submitComment, saveComment].forEach(function (input) {
        const li = document.createElement("li");
        li.append(input);
        comment_actions.append(li);
    });

    submitContainer.append(comment_actions);
}

window.addEventListener("load", function() {
    let url = window.location.toString();
    let pathname = window.location.pathname;

    let workNumMatch = pathname.match(/\/works\/(?:\d+\/chapters\/)?(\d+)?$/);

    if (workNumMatch) {
        const workNum = workNumMatch[1];

        retriveComment(url, workNum);
        stickyNavigation();
        stickyComment();
        createCommentNavigation(url, workNum);
        GM_addStyle(GM_getResourceText("style"));
    }

}, false);

