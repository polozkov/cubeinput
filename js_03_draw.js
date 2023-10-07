"use strict";
var G = G;

//переводим строку в массив кубов (полику, по кодировке Сергея Полозкова)
G.f_code_to_xyz_array = function (s) {
	var a = [], i_xyz = [0, 0, 0];

	for (let i = 0; i < s.length; i += 1) {
		if ('0123456789'.includes(s[i])) {
			i_xyz[0] = '0123456789'.indexOf(s[i]);
			a.push(i_xyz.slice());
		}
		if (s[i] === ',') {
			i_xyz = [0, i_xyz[1] + 1, i_xyz[2]]
		}
		if (s[i] === ';') {
			i_xyz = [0, 0, i_xyz[2] + 1]
		}
	}
	//console.log("a.length", a.length);
	return a;
};

G.D = {
	canvas: {},
	ctx: {},
	el_text: document.getElementById("id_text"),
	el_button_solve: document.getElementById("id_button_solve"),

	fig: {
		w: null,
		h: null,

		total_cell: null,
		mini_cell: null,
		line_w: null,
	},

	f_set_canvas_ctx_fig: function (xyz_sizes = [5,5,5]) {
		G.D.canvas = document.getElementById('id_canvas');

		G.D.ctx = G.D.canvas.getContext('2d');

		G.D.fig.w = G.D.canvas.clientWidth;
		G.D.fig.h = G.D.canvas.clientHeight;
		G.D.canvas.width = G.D.fig.w;
		G.D.canvas.height = G.D.fig.h;

		G.D.fig.total_cell = Math.round(Math.min(G.D.fig.w /xyz_sizes[0], G.D.fig.h / xyz_sizes[1]));
		G.D.fig.mini_cell = Math.round(G.D.fig.total_cell / (xyz_sizes[2] * 2));
		G.D.fig.line_w = Math.round(G.D.fig.total_cell / (xyz_sizes[2] * 2) / 1.5);
	},

	rgb: {
		//цвета для элементов (радуга, потом светлые оттенки серого и до чёрного)
		arr_colors: ["#F00", "#F90", "#FF0", "#0A0", "#99F", "#009", "#606", "#888", "#444", "#000"]
	},

	//рисуй куб на холсте как рамку
	f_draw_cube: function (xyz, n_col, xy_shift) {
		var x = xyz[0] * G.D.fig.total_cell + (G.D.fig.line_w - 1) / 2,
			y = xyz[1] * G.D.fig.total_cell + (G.D.fig.line_w - 1) / 2,
			z = xyz[2] * G.D.fig.mini_cell,
			x1 = x + z,
			y1 = y + z,
			x2 = x + G.D.fig.total_cell - G.D.fig.mini_cell - z,
			y2 = y + G.D.fig.total_cell - G.D.fig.mini_cell - z;

		G.D.ctx.strokeStyle = G.D.rgb.arr_colors[n_col];
		G.D.ctx.lineWidth = G.D.fig.line_w;
		G.D.ctx.strokeRect(x1 + xy_shift[0], y1 + xy_shift[1], x2 - x1 + 1, y2 - y1 + 1);
	},

	f_draw_polycube: function (polycube, n_col, xy_shift) {
		var i;
		for (i = 0; i < polycube.length; i += 1) {
			G.D.f_draw_cube(polycube[i], n_col, xy_shift);
		}
	}
};

G.D.el_text.value = `4,4,4=осенний кубик в виде уголка
123,0123,012,01;0123,0,0,0;012,0,0;01,0
123,1=4 красный Г
123,2=4 оранжевый Т
12,23=4 жёлтый Z
13,123=5 зелёный П
2,123,1=5 голубой W
1,123,2=5 синий Т+рука сверху`;

//оставляет только строку до определённого символа (например, "=")
function f_string_before_char(s, char = "=") {
	var result_string = "";
	for (let i = 0; i < s.length; i+=1) {
		if (s[i] == char) {return result_string; }
		result_string += s[i];
	}
	return result_string;
}

//решает новое задание
function f_test_new(s_text) {
	var ARR_STR = s_text.split('\n');
	var string_xyz = f_string_before_char(ARR_STR[0]).split(',');
	var sizes_xyz = [+string_xyz[0], +string_xyz[1], +string_xyz[2]];
	
	G.D.f_set_canvas_ctx_fig(sizes_xyz);

	var p_cube = G.f_code_to_xyz_array(f_string_before_char(ARR_STR[1]));

	var el_krasnouhov = [];
	for (let i = 2; i < ARR_STR.length; i+=1) {
		el_krasnouhov.push(G.f_code_to_xyz_array(f_string_before_char(ARR_STR[i])));
	}

	var	solution = G.S.f_solve_polycubes(p_cube, el_krasnouhov); 
	
	//console.log(solution);

	for (let i = 0; i < solution[0].length; i += 1) {
		G.D.f_draw_polycube(solution[0][i], i, [0, 0]);
	}
};

f_test_new(G.D.el_text.value);

function f_press() {
	console.log(G.D.el_text.value);
	f_test_new(G.D.el_text.value);
}

G.D.el_button_solve.onclick = f_press;