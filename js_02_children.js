"use strict";
var G = G;

//имеет ли блок тень (проверка для авторского задания Сергея Полозкова)
//для китайских псевдо-кубиков сома, где одно тетрамино (объёмный левый узел) отсутствует
//а вмето него присутствует квадрат 2 на 2 из четырёх кубиков
G.S.f_block_has_shadow = function(gotten_block) {
	var len = gotten_block.arr.length;
	var z = gotten_block.xyz[2];
	var xy = gotten_block.xyz[1] * gotten_block.xyz[0];

	var baze_z = gotten_block.xyz[2] - 1;
	for (let iz = gotten_block.xyz[2] - 1; iz >=0; iz-=1)
	for (let iy = 0; iy < gotten_block.xyz[1]; iy+=1)
	for (let ix = 0; ix < gotten_block.xyz[0]; ix+=1) {
		if (G.B.f_get_value(gotten_block, [ix,iy,iz])) {
			baze_z = Math.min(baze_z, iz);
		}
	} 

	for (let iz = 1; iz < gotten_block.xyz[2]; iz+=1)
	for (let iy = 0; iy < gotten_block.xyz[1]; iy+=1)
	for (let ix = 0; ix < gotten_block.xyz[0]; ix+=1) 
	if (
		(G.B.f_get_value(gotten_block, [ix,iy,iz])) &
		(!G.B.f_get_value(gotten_block, [ix,iy,iz-1]))
	) {return true;}

	return false;
};

//все варианты, которыми внутренний блок может быть размещём в границах меньшего
G.S.f_children = function (b_main, b_in) {
	var polycubes_24 = G.C.f_polycube_all_rotations(G.B.f_block_to_polycube(b_in)),
		different_rotations = [],
		result_children = [],
		i;
	
	//генерируй все уникальные вращения
	function f_push_if_is_unique(get_polycube_24_index) {
		var tested_block = G.B.f_polycube_to_block(polycubes_24[get_polycube_24_index]), i;

		//Проверка на наличие тени, (только для авторских заданий Сергея Полозкова)
		//прросто раскомментируй следующую строку
		//if (G.S.f_block_has_shadow(tested_block)) {return; }

		//если вращения совпадают, то выйди
		for (i = 0; i < different_rotations.length; i += 1) {
			if (G.B.f_are_equal(tested_block, different_rotations[i])) {
				return;
			}
		}
		different_rotations.push(tested_block);
	}
	
	//сдвиги уникальных вращений в большой бигуре
	function f_try_shift_block(b_shift) {
		if (G.B.f_is_big_to_pack(b_main.xyz, b_shift.xyz) === false) {return; }
		var d_xyz = G.C.f_cube_minus(b_main.xyz, b_shift.xyz), ix, iy, iz;
		
		function f_add_shifted(xyz) {
			var new_polycube = G.C.f_polycube_move(G.B.f_block_to_polycube(b_shift), xyz),
				new_block = G.B.f_extend(G.B.f_polycube_to_block(new_polycube), b_main.xyz);
			//если внутри родителя, то добавь этот блок
			if (G.B.f_is_parent(b_main.arr, new_block.arr)) {
				result_children.push(new_block);
			}
		}

		//добавь все возможные сдвиги
		for (iz = 0; iz <= d_xyz[2]; iz += 1) {
			for (iy = 0; iy <= d_xyz[1]; iy += 1) {
				for (ix = 0; ix <= d_xyz[0]; ix += 1) {
					f_add_shifted([ix, iy, iz]);
				}
			}
		}
			
	}
	
	for (i = 0; i < 24; i += 1) {f_push_if_is_unique(i); }
	
	for (i = 0; i < different_rotations.length; i += 1) {
		f_try_shift_block(different_rotations[i]);
	}
	
	return result_children;
};

//дети сортируются по числу вариантов (сначала те, где меньше вариантов)
G.S.f_array_sorted_children = function (p_main, p_arr) {
	var b_main = G.B.f_polycube_to_block(p_main),
		b_children = [],
		b_sorted = [],
		p_on_zero = [],
		i,
		t;
	for (i = 0; i < p_arr.length; i += 1) {
		p_on_zero = G.C.f_polycube_to_zero(p_arr[i]);
		b_children.push(G.S.f_children(b_main, G.B.f_polycube_to_block(p_on_zero)));
	}
	
	//сортируй по числу вариантов
	for (i = 0; b_sorted.length < p_arr.length; i += 1) {
		for (t = 0; t < b_children.length; t += 1) {
			if (b_children[t].length === i) {
				b_sorted.push(b_children[t]);
			}
		}
	}
	
	//если нужно отсортировать по числу вариантов, то раскомментируй следующую строчку
	//return b_sorted;
	return b_children;
};

//таблица совместимости двух элементов (проверив, что они не пересекаются)
G.S.f_create_table = function (b_sorted) {
	function f_generate_independent(index_1, index_2) {
		var result_arr = [], b_now = b_sorted[index_1][index_2], i1, i2, is_ok;
		for (i1 = 0; i1 < b_sorted.length; i1 += 1) {
			result_arr.push([]);
			for (i2 = 0; i2 < b_sorted[i1].length; i2 += 1) {
				is_ok = ((i1 !== index_1) && G.B.f_is_independent(b_now.arr, b_sorted[i1][i2].arr));
				result_arr[i1].push(is_ok ? 1 : 0);
			}
		}
		return result_arr;
	}
	var result_table = [], t1, t2;
	for (t1 = 0; t1 < b_sorted.length; t1 += 1) {
		result_table.push([]);
		for (t2 = 0; t2 < b_sorted[t1].length; t2 += 1) {
			result_table[t1].push(f_generate_independent(t1, t2));
		}
	}
	return result_table;
};

G.S.f_solve_polycubes = function (p_main, p_arr, need_one_solution) {
	var sorted_children = G.S.f_array_sorted_children(p_main, p_arr),
		main_table = G.S.f_create_table(sorted_children),
		result_solutions = [];

	(function f_recursive_search(arr_index) {
		//если нужно одно решение и какое-то решение найдено, то выйди
		if (need_one_solution && (result_solutions.length > 0)) {
			return;
		}
		
		function f_is_compatible_with_previous(fig_n, test_n) {
			var i;
			for (i = 0; i < fig_n; i += 1) {
				//если есть коллизия (нельзя поставить из-за пересечения кубов)
				if (!(main_table[i][arr_index[i]][fig_n][test_n])) {return false; }
			}
			return true;
		}
		
		if (arr_index.length === main_table.length) {
			//добавлен последний элемент, запиши найденное в таблицу
			result_solutions.push(arr_index.slice());
			return;
		}
		
		var i_step = arr_index.length, t;
		for (t = 0; t < main_table[i_step].length; t += 1) {
			if (f_is_compatible_with_previous(i_step, t)) {
				//сам рекурсивный посиск
				arr_index.push(t);
				f_recursive_search(arr_index);
				arr_index.pop();
			}
		}
	}([]));
	
	function f_result_solutions_to_polycubes(solutions) {
		var arr_result_polycubes = [], i;
		
		function f_one_solution(solution) {
			var arr_polycube = [], i_block = [], t;
			for (t = 0; t < solution.length; t += 1) {
				i_block = sorted_children[t][solution[t]];
				arr_polycube.push(G.B.f_block_to_polycube(i_block));
			}
			return arr_polycube;
		}
		
		for (i = 0; i < solutions.length; i += 1) {
			arr_result_polycubes.push(f_one_solution(solutions[i]));
		}
		return arr_result_polycubes;
	}

	return f_result_solutions_to_polycubes(result_solutions);
};