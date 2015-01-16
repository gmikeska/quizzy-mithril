(function (){
	window.Quizzy = {}
	var correctIcon = "correct.jpg"
	var h1 = m.bind(null, "h1")
	var h3 = m.bind(null, "h3")
	var br = m.bind(null, "br")
	var center = m.bind(null, "center")
	var incorrectIcon = "incorrect.png"
	Quizzy.vm = {

		questions: m.prop([]),
		resultTitle:m.prop("Results:"),
		results:m.prop("Your results will appear here when you click 'submit'."),
		currentUser:{
			name:m.prop(''),
			scores:function()
			{
				return Quizzy.vm.userData()[Quizzy.vm.currentUser.name()]
			},
			totalAttempts:function()
			{
				return Quizzy.vm.currentUser.scores().length
			},
			average:function()
			{
				return Quizzy.vm.currentUser.scores().average()
			}
		},
		userData:m.prop({}),
		nextId:function()
		{

			if(this.questions().length == 0)
			{
				return 1
			}		
			else
			{
				return this.questions()[this.questions().length-1].id+1
			}

		},
		addQuestion:function(text, answers, solution)
		{
			list = this.questions()
			q = {id:this.nextId(), text:text, answers:answers, solution:solution}
			q.correct = function()
			{
				var iscorrect = this.selected === this.solution
				return iscorrect
			}
			list.push(q)
			this.questions(list)
		},
		signedIn:function()
		{
			return this.currentUser.name() != '' && Object.keys(this.userData()).length != 0 
		},
		showSignIn:function()
		{
			if(this.signedIn())
				return "display:none;"
			else
				return "display:block;"
		},
		highScores:function()
		{
			var data = this.userData()
			var elements = []
			var highScores = []
			var names = 
			highScores.push(center(h3('High Scores')))
			players = Object.keys(data)
			players.each(function(name){
				data[name] = data[name].unique().sort().reverse()
				data[name].each(function(score)
				{
					score = Math.round(score)
					if(highScores.length < 10)
					{
						highScores.push({name:name, score:score})
					}
					else if(score > highScores[0].score)
					{
						highScores.unshift({name:name, score:score})
						highScores.pop()
					}
					else if(score > highScores[highScores.length-1])
					{
						highScores.pop()
						highScores.push(score)
						highScores.sort(function(a, b){
							return b.score - a.score

						})

					}
					
				})
			})
			highScores.sort(function(a, b){
							return b.score - a.score

						})
			elements.push(center(h3('High Scores')))
			highScores.each(function(x){
				if(x.name && x.score){
				elements.push(x.name+":"+x.score)
				elements.push(br())
			}
			})
			return elements
		}
	}

	Quizzy.nextChar = function(choice)
	{
		return String.fromCharCode(choice.charCodeAt(0) + 1);
	}

	Quizzy.find = function(id){
		var questions  = Quizzy.vm.questions()
		for(var i=0; i< questions.length; i++)
		{
			if(questions[i].id === id) return questions[i]
		}
	}

	Quizzy.controller = function () {
		var ctrl = {}
		var vm = Quizzy.vm
		var currentUser = vm.currentUser
		ctrl.updateQuestion = function(id, selected){
			var question = Quizzy.find(id)
			question.selected = selected.target.value
			iscorrect  = question.correct()
			if(iscorrect)
			{
				question.icon = correctIcon
			}
			else
			{
				question.icon = incorrectIcon
			}
			
		}
		ctrl.signIn = function(field)
		{
			currentUser.name(field.target.value)

		}
		ctrl.grade = function()
		{
			return vm.questions().reduce(function(p, x){
				if(x.correct())
					p++
				return p
			}, 0)
		}
		ctrl.submit = function()
		{
			correct = ctrl.grade()
			console.log(correct)
			total = vm.questions().length
			score = correct/total*100
			ctrl.save(score)
			vm.resultTitle("Results for "+currentUser.name())
			vm.results(["Total correct:"+correct,br(),"Score:"+correct+"/"+total+"="+score,br(),"Your average score is "+currentUser.average(), br(), vm.highScores()])
			


		}
		ctrl.load = function()
		{
			var dataString = localStorage.getItem('userData')
			var name = vm.currentUser.name()

			if (dataString != null)
			{
				data = JSON.parse(dataString)
			}
			else
			{
				var data = vm.userData()
			}

			if(data[name] == undefined)
			{
				data[name] = []
			}

			vm.userData(data)
		}
		ctrl.save = function(score)
		{
			var name = currentUser.name()
			data = Quizzy.vm.userData()
			data[name].push(score)
			vm.userData(data)
			var dataString = JSON.stringify(data)
			localStorage.setItem('userData', dataString)
		}
		return ctrl
	}

	Quizzy.view = function(ctrl){

		vm = Quizzy.vm
		return [m('#name',{style:vm.showSignIn()}, [h3("Enter your name to take the quiz!"),br(), m('label[for="name"]','Name:'),m('input[type="text"]',{
			name:'name',
			value:Quizzy.vm.currentUser.name(),
			onchange:ctrl.signIn
	}), m('button#signIn',{class:'btn btn-lg btn-success', onclick:ctrl.load}, "Start Quiz!")]),
		m("#info", [h1(vm.resultTitle()), vm.results()]), m('.questions', [
				vm.questions().map(qView),
				m('button#submit',{class:'btn btn-lg btn-success',onclick:ctrl.submit}, "Submit")
				]
			)
		]
	
		function qView(question, qnum){
			var choice = 'A'
			answers = question.answers.map(function(x, i){
				result = [m('span.answer', [choice+".", m('input[type=radio]', {
					name:question.id,
					value:choice,
					disabled:!Quizzy.vm.signedIn(),
					checked:(i == question.selected),
					onchange: ctrl.updateQuestion.bind(null, question.id)
				}), x, br()])]
				choice  = Quizzy.nextChar(choice)
				return result
			})
			q = qnum+1
			return m('.questions', [
				m(".question",{id:question.id}, [q+'.'+question.text, m("span.icon", m('img', {src:question.icon})), m("div", answers)])
				
			])
		}


	}
})()