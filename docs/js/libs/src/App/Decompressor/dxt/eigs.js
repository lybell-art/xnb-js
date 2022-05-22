/*
 * get Eigen-values and Eigen-vectors from symmetric matrix
 * I can use it directly because covarience matrix is symmetric - Lybell
 * from DiagonalizeJS : https://github.com/arkajitmandal/DiagonalizeJS
 * made by Arkajit Mandal
 */

// Rotation Matrix
function Rot(theta){
	let Mat = [[Math.cos(theta),Math.sin(theta)],[-Math.sin(theta),Math.cos(theta)]];
	return Mat
}
// Givens Matrix
function Rij(k,l,theta,N){
	let Mat = Array(N) 
	for (let i = 0; i<N;i++){
		Mat[i] = Array(N) 
	}
	// Identity Matrix
	for (let i = 0; i<N;i++){
		for (let j = 0; j<N;j++){
			Mat[i][j] = (i===j)*1.0;
		}
	}
	let Rotij = Rot(theta);

	// Put Rotation part in i, j
	Mat[k][k] = Rotij[0][0] // 11
	Mat[l][l] = Rotij[1][1] // 22
	Mat[k][l] = Rotij[0][1] // 12
	Mat[l][k] = Rotij[1][0] // 21
	return Mat
}

// get angle
function getTheta(aii,ajj,aij){
	let  th = 0.0 
	let denom = (ajj - aii);
	if (Math.abs(denom) <= 1E-12){
		th = Math.PI/4.0
	}
	else {
		th = 0.5 * Math.atan(2.0 * aij / (ajj - aii) ) 
	}
	return th 
}
// get max off-diagonal value from Upper Diagonal
function getAij(Mij){
	let N = Mij.length;
	let maxMij = 0.0 ;
	let maxIJ  = [0,1];
	for (let i = 0; i<N;i++){
		for (let j = i+1; j<N;j++){ 
			if (Math.abs(maxMij) <= Math.abs(Mij[i][j])){
				maxMij = Math.abs(Mij[i][j]);
				maxIJ  = [i,j];
			} 
		}
	}
	return [maxIJ,maxMij]
}
// Unitary Rotation UT x H x U
function unitary(U,H){
	let N = U.length;
	// empty NxN matrix
	let Mat = Array(N) 
	for (let i = 0; i<N;i++){
		Mat[i] = Array(N) 
	}
	// compute element
	for (let i = 0; i<N;i++){
		for (let j = 0; j<N;j++){
			Mat[i][j] =  0 
			for (let k = 0; k<N;k++){
				for (let l = 0; l<N;l++){
					Mat[i][j] = Mat[i][j] + U[k][i] * H[k][l] * U[l][j];
				}
			}
		}
	}
	return Mat;
}

// Matrix Multiplication
function AxB(A,B){
	let N = A.length;
	// empty NxN matrix
	let Mat = Array(N) 
	for (let i = 0; i<N;i++){
		Mat[i] = Array(N) 
	}
	for (let i = 0; i<N;i++){
		for (let j = 0; j<N;j++){
			Mat[i][j] =  0 
			for (let k = 0; k<N;k++){
				Mat[i][j] = Mat[i][j] + A[i][k] * B[k][j] ; 
			}
		}
	}
	return Mat;
}

function eigens(Hij, convergence = 1E-7){
	let N = Hij.length; 
	let Ei = Array(N);
	let e0 =  Math.abs(convergence / N)
	// initial vector
	let Sij = Array(N);
	for (let i = 0; i<N;i++){
		Sij[i] = Array(N) 
	}
	// Sij is Identity Matrix
	for (let i = 0; i<N;i++){
		for (let j = 0; j<N;j++){
			Sij[i][j] = (i===j)*1.0;
		}
	}
	// initial error
	let Vab = getAij(Hij); 
	//  jacobi iterations
	while (Math.abs(Vab[1]) >= Math.abs(e0)){
		// block index to be rotated
		let i =  Vab[0][0];
		let j =  Vab[0][1];
		// get theta
		let psi = getTheta(Hij[i][i], Hij[j][j], Hij[i][j]); 
		// Givens matrix
		let Gij =  Rij(i,j,psi,N);
		// rotate Hamiltonian using Givens
		Hij = unitary(Gij,Hij); 
		// Update vectors
		Sij = AxB(Sij,Gij); 
		// update error 
		Vab = getAij(Hij); 
	}
	for (let i = 0; i<N;i++){
		Ei[i] = Hij[i][i]; 
	}
	return sorting(Ei, Sij);
}

function sorting(values, vectors){
	let eigsCount = values.length;
	let eigenVectorDim = vectors.length;
	let pairs = Array.from({length:eigsCount}, (_,i)=>{
		let vector = vectors.map((v)=>v[i]);
		return {value:values[i], vec:vector};
	});
	pairs.sort((a,b)=>b.value - a.value);

	let sortedValues = pairs.map(({value})=>value);
	let sortedVectors = pairs.map(({vec})=>vec);
	return [sortedValues, sortedVectors];
}

function dominentPrincipalVector(matrix)
{
	let [,[dominentVector]] = eigens(matrix);
	return dominentVector;
}

export {eigens, dominentPrincipalVector};