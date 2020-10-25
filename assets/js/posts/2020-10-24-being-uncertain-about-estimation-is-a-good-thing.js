function submitQuiz(){
    for(var i = 1;i <= 10; i++){
        lb = parseFloat(document.getElementById("lb" + i).firstChild.value)
        ub = parseFloat(document.getElementById("ub" + i).firstChild.value)
        answer = document.getElementById("answer" + i)

        //show answer and remove existing classes
        answer.classList.remove("right")
        answer.classList.remove("wrong")
        answer.style.display = "inline"

        //process answer
        if(parseFloat(answer.innerHTML) >= lb && parseFloat(answer.innerHTML) <= ub) answer.classList.add("right")
        else answer.classList.add("wrong")

        //process text
        if(document.getElementsByClassName("right").length == 9) document.getElementById("totalAnswers").innerHTML = "You scored 9 correct outcomes,<br>your estimates are perfectly calibrated!"
        else if(document.getElementsByClassName("right").length < 9) document.getElementById("totalAnswers").innerHTML = "You scored less than 9 correct outcomes,<br>you are overconfident (optimistic) in your estimation!"
        else document.getElementById("totalAnswers").innerHTML = "You scored more than 9 correct outcomes<br>you are underconfident (pessimistic) in your estimation!"
    }
}