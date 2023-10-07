"use strict";
var G = {
	//кубы и поликубы
	C: {},
	
	//3д блоки в виде булева массива (0,1) развёрнутого в линейный массив (с размерами по трём осям)
	B: {},

	//решатель головоломки
	S: {},

	//прорисовка на холсте
	D: {},
	
	//24 самосовмещения куба (в виде матриц поворота)
	arr_24_matrix: []
};

//сгенерируй 24 матрицы поворота
(function f_generate_24_orientations_for_G_arr_24_matrix() {
	var ix, iy, iz, m = [],
	  //6 направлений: по два на каждой декартовой оси
		ARR_6_DIR = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

	//определитель матрицы поворота 3 на 3
	function f_det_3_by_3(m) {
		var plus =
			m[0][0] * m[1][1] * m[2][2] +
			m[0][1] * m[1][2] * m[2][0] +
			m[0][2] * m[1][0] * m[2][1],
			minus =
			m[0][0] * m[1][2] * m[2][1] +
			m[0][1] * m[1][0] * m[2][2] +
			m[0][2] * m[1][1] * m[2][0];
		return plus - minus;
	}

	//цикл 6*6*6 (для каждой из осей), отфильтруй только если оси по разным направлениям и нужной ориентации
	for (ix = 0; ix < 6; ix += 1) {
		for (iy = 0; iy < 6; iy += 1) {
			for (iz = 0; iz < 6; iz += 1) {
				m = [ARR_6_DIR[ix], ARR_6_DIR[iy], ARR_6_DIR[iz]];
				//если определитель матрицы поворота = 1, то эта матрица и есть поворот (без отражения)
				if (f_det_3_by_3(m) === 1) {
					G.arr_24_matrix.push([m[0].slice(), m[1].slice(), m[2].slice()]);
				}
			}
		}
	}
}());

//операции с 3Д точками (кубическими ячейками единичного размера)
G.C = {
	f_cube_plus: function (a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	},
	f_cube_minus: function (a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	},
	
	//поворот куба с помощью матрицы поворота
	f_cube_rotate: function (v, m) {
		var x = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0],
			y = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1],
			z = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2];
		return [x, y, z];
	},

	//сдвиг поликуба (массива из нескольких кубиков)
	f_polycube_move: function (p, m) {
		var new_p = [], len = p.length, i;
		for (i = 0; i < len; i += 1) {
			new_p.push(G.C.f_cube_plus(p[i], m));
		}
		return new_p;
	},

	//поворот поликуба (массива из нескольких кубиков), поворот задан числом от 0 до 23 (номером)
	f_polycube_rotate: function (p, n24) {
		var new_p = [], len = p.length, i, m = G.arr_24_matrix[n24];
		for (i = 0; i < len; i += 1) {
			new_p.push(G.C.f_cube_rotate(p[i], m));
		}
		return new_p;
	},

	//нижняя граница поликуба
	f_polycube_min: function (p) {
		var xyz = p[0].slice(), len = p.length, i, i02;
		for (i = 1; i < len; i += 1) {
			for (i02 = 0; i02 <= 2; i02 += 1) {
				xyz[i02] = Math.min(xyz[i02], p[i][i02]);
			}
		}
		return xyz.slice();
	},
	
	//верхняя граница поликуба
	f_polycube_max: function (p) {
		var xyz = p[0].slice(), len = p.length, i, i02;
		for (i = 1; i < len; i += 1) {
			for (i02 = 0; i02 <= 2; i02 += 1) {
				xyz[i02] = Math.max(xyz[i02], p[i][i02]);
			}
		}
		return xyz.slice();
	},
	
	//сдвиг поликуба, чтобы он упирался в 0 (нижние границы были [0,0,0])
	f_polycube_to_zero: function (p) {
		var xyz_min_reverse = G.C.f_cube_minus([0, 0, 0], G.C.f_polycube_min(p));
		return G.C.f_polycube_move(p, xyz_min_reverse);
	},
	
	//массив из 24 поворотов поликуба
	f_polycube_all_rotations: function (p) {
		var i24, arr_result = [];
		for (i24 = 0; i24 < 24; i24 += 1) {
			arr_result.push(G.C.f_polycube_to_zero(G.C.f_polycube_rotate(p, i24)));
		}
		return arr_result;
	}
};

//топерации с блоком (трёхмерным массивом, который развернули в одномерный)
G.B = {

	//создай пустой блок заданного размера
	f_create_empty_block: function (xyz) {
		var i, arr = [], len = xyz[0] * xyz[1] * xyz[2];
		for (i = 0; i < len; i += 1) {arr.push(0); }
		return {
			arr: arr,
			len: len,
			xyz: xyz.slice()
		};
	},
	
	//конвертируй номер в координату xyz, зная размеры трёхмерного массива
	f_n_to_xyz: function (xyz_sizes, n) {
		var x = n % xyz_sizes[0], y, z;
		n = (n - x) / xyz_sizes[0];
		y = n % xyz_sizes[1];
		n = (n - y) / xyz_sizes[1];
		z = n % xyz_sizes[2];
		return [x, y, z];
	},
	
	//получи значение из блока по координате
	f_get_value: function (b, xyz) {
		var n = xyz[0] + xyz[1] * b.xyz[0] + xyz[2] * b.xyz[0] * b.xyz[1];
		return b.arr[n];
	},
	
	//установи новое значение в блоке в данной координате
	f_set_value: function (b, xyz, new_value) {
		b.arr[xyz[0] + xyz[1] * b.xyz[0] + xyz[2] * b.xyz[0] * b.xyz[1]] = new_value;
	},
	
	//вылезает ли за границу
	f_is_big_to_pack: function (xyz_box, xyz_in) {
		return ((xyz_box[0] >= xyz_in[0]) && (xyz_box[1] >= xyz_in[1]) && (xyz_box[2] >= xyz_in[2]));
	},
	
	//конвертируй блок (булевый) в поликуб (массив трёхмерных координат)
	f_block_to_polycube: function (b) {
		var polycube = [], ix, iy, iz;
		for (iz = 0; iz < b.xyz[2]; iz += 1) {
			for (iy = 0; iy < b.xyz[1]; iy += 1) {
				for (ix = 0; ix < b.xyz[0]; ix += 1) {
					if (G.B.f_get_value(b, [ix, iy, iz]) !== 0) {
						polycube.push([ix, iy, iz]);
					}
				}
			}
		}
		return polycube;
	},
	
	//конвертируй поликуб (который подвинут к нулям) в блок (булевый)
	f_polycube_to_block: function (p) {
		var sizes = G.C.f_cube_plus(G.C.f_polycube_max(p), [1, 1, 1]),
			b = G.B.f_create_empty_block(sizes),
			i;
		for (i = 0; i < p.length; i += 1) {
			G.B.f_set_value(b, p[i], 1);
		}
		return b;
	},
	
	//убедись, что два блока эквивалентны
	f_are_equal: function (block_a, block_b) {
		var i;
		for (i = 0; i <= 2; i += 1) {
			if (block_a.xyz[i] !== block_b.xyz[i]) {
				return false;
			}
		}
		for (i = 0; i <= block_a.len; i += 1) {
			if (block_a.arr[i] !== block_b.arr[i]) {
				return false;
			}
		}
		return true;
	},
	
	//расширь границы блока, заполнив их кубами
	f_extend: function (b, new_xyz) {
		var i, t_xyz, new_b = G.B.f_create_empty_block(new_xyz);
		for (i = 0; i < b.len; i += 1) {
			t_xyz = G.B.f_n_to_xyz(b.xyz, i);
			G.B.f_set_value(new_b, t_xyz, b.arr[i]);
		}
		return new_b;
	},
	
	//arr_a - родитель, arr_b - потомок (который внутри). Проверь, что это действительно так.
	f_is_parent: function (arr_a, arr_b) {
		var i;
		for (i = arr_a.length; i >= 0; i -=1) {
			if ((arr_a[i] === 0) && (arr_b[i] === 1)) {
				return false;
			}
		}
		return true;
	},
	
	//убедись, что в массивах нет пересечений
	f_is_independent: function (arr_a, arr_b) {
		var i;
		for (i = arr_a.length; i >= 0; i -=1) {
			if ((arr_a[i] === 1) && (arr_b[i] === 1)) {
				return false;
			}
		}
		return true;
	}
};