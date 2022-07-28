using System.Collections;
using System.Collections.Generic;

//500 - 000111110100 - 9 bits
//250000 - 18 bits
//store id of boundry - 9 bits
//store bit for  direction of leaf cells - 4 bits




[System.Flags]
enum GridType: uint {
	None = 0,
	//               Ty UDLR.   <9>   .   <9>   .
	Bdy = 0b00000000_10_0000_000000000_000000000,
	Isl = 0b00000000_01_0000_000000000_000000000,

	Mask = Bdy|Isl,
	UnMask = ~Mask
}



[System.Flags]
enum Directions: uint {
	None = 0,
	//             Ty UDLR.   <9>   .   <9>   .
	U = 0b00000000_00_1000_000000000_000000000,
	D = 0b00000000_00_0100_000000000_000000000,
	L = 0b00000000_00_0010_000000000_000000000,
	R = 0b00000000_00_0001_000000000_000000000,

	Mask = U|D|L|R,
	UnMask = ~Mask
}

[System.Flags]
enum Position: uint {
	None = 0,
	//                UDLR.   <9>   .   <9>   .
	X = 0b000000000_0_0000_111111111_000000000,
	Y = 0b000000000_0_0000_000000000_111111111,

	Mask = X|Y,
	UnMask = ~Mask
}

public class Solution {
	private const uint MaxGrid = 250000;//00000000 0000 00 111101000 010010000;
	private const uint ComponentBits = 9;
	private const uint ValueOffset = 3; //0,1,2 all used types

	private uint n; 
	private uint distinct; //max of half the count of the grid, cannot have more than that # of lone points (n^2)/2 [this is because all lone make checkerboard pattern]
	private uint[] loopsize; //stores length of each loop;
	private uint[] bridges; //stores position and neigbour direction info.

	private uint loopCount = 0;
	private uint bridgeCount = 0;
	
	private Stack<uint> visitStack;

	private static int[][] testData = new int[][]{
		new int[]{0,1,0,0,0,1},
		new int[]{1,0,0,0,1,0},
		new int[]{1,1,0,1,0,0},
		new int[]{0,1,1,0,1,0},
		new int[]{0,0,0,1,0,1},
		new int[]{1,1,0,0,1,1},
	};

    
    public int LargestIsland(int[][] grid) {
        n = grid.Length;
		distinct = (n*n)/2; 
		loopsize = new uint[distinct];
		bridges = new uint[distinct];
		visitStack = new Stack<uint>(distinct);
		

        //Iterate over all entries
        for (int y=0; y<n; y++) { 
            for (int x=0; x<n; x++) {
				if (grid[y][x] == 1) {

				}
            }
        }
        
        
        
        
        return 0;
        
    }

	private bool InRange(int i) => (0<=i && i<n);
	private uint ToPosition(int x, int y) => (x<<ComponentBits)|y;
	private (int x, int y) FromPosition(uint pos) => ((pos&Position.X)>>ComponentBits, (pos&Position.Y));
	//boundries when visited recieve the same ID as the loop that first found them.



	public bool CheckSelfVisit(uint ID, int x, int y, ref int[][] grid) {
		ID += ValueOffset; //Offset it to compare.
		int gridDirections = grid[x][y]&Directions.Mask;
		//No visits, return.
		if (gridDirections == Directions.None) return false;
		//Check each marked source direction on the node
		else if ((gridDirections&Directions.U != Directions.None) && (InRange(x+1) && (grid[x+1][y]&Position.Mask == ID))) return true;
		else if ((gridDirections&Directions.D != Directions.None) && (InRange(x-1) && (grid[x-1][y]&Position.Mask == ID))) return true;
		else if ((gridDirections&Directions.L != Directions.None) && (InRange(y+1) && (grid[x][y+1]&Position.Mask == ID))) return true;
		else if ((gridDirections&Directions.R != Directions.None) && (InRange(y-1) && (grid[x][y-1]&Position.Mask == ID))) return true;
		//All visits were done by other Loops.
		else return false;
	}

	public void QueueAdjacent(Directions sourceDirection, int x, int y, ref int[][] grid) {
		const Directions gridDirections = Directions.Mask&(~sourceDirection); //Remove origin dir.
		//No directions, return.
		if (gridDirections == Directions.None) return false;

		//Queue all viable nodes.
		else if ((gridDirections&Directions.U != Directions.None) && InRange(x+1)) visitStack.Push(ToPosition(x+1, y));
		else if ((gridDirections&Directions.D != Directions.None) && InRange(x-1)) visitStack.Push(ToPosition(x-1, y));
		else if ((gridDirections&Directions.L != Directions.None) && InRange(y+1)) visitStack.Push(ToPosition(x, y+1));
		else if ((gridDirections&Directions.R != Directions.None) && InRange(y-1)) visitStack.Push(ToPosition(x, y-1));
	}



	private uint NewLoopID() {
		const uint ID = loopCount;
		++loopCount;
		return ID;
	}

	private uint NewBridgeID() {
		const uint ID = bridgeCount;
		++bridgeCount;
		return ID;
	}



	//2 == visited; i<0 == -loopID
	public void propagate(ref int[][] grid, int x, int y) {
		const int ID = NewLoopID(); //LoopID




		int count = 0;
		visitStack.Push(ToPosition(x,y));//starts with initials
		Directions visitDirection = Directions.None;
		while (visitStack.Count > 0) {
			var position = FromPosition(visitStack.Pop());

	
			int filteredGridValue = grid[position.x][position.y]&Position.Mask; //Clean any non-identifying info from it.

			//If 0 its a boundry, mark as visited and carry on,
			if (filteredGridValue == 0) {
				grid[position.x][position.y] = (2)|visitDirection|GridType.Bdy; //add direction of unique loop id.
			//If 1 its an unvisited part of loop, queue next ones
			} else if (filteredGridValue == 1) {
				//give it the loops id and add some direction info to help it.
				count++; //increment counter.
				grid[position.x][position.y] = (ID+ValueOffset)|visitDirection|GridType.Isl; 
				visitStack.Push(ToPosition(x,y));
				QueueAdjacent(visitDirection, x ,y, ref grid); //Queue others.

			//If 2, its a boundry with only one visiter so far, check if its the same one as this.
			} else if (filteredGridValue == 2) {
				//Has not visited node before, make it a bridge
				if (CheckSelfVisit(ID, x,y, ref grid) == false) {
					grid[position.x][position.y] = (NewBridgeID()+ValueOffset)|visitDirection|GridType.Bdy;
				} //Has visited it before, skip.

			//If >2 its an already visited part of the grid, check if its value is this loops id, if true carry on; if false make bridge.
			} else if (filteredGridValue > 2) {
				switch (grid[position.x][position.y]&GridType.Mask) {
					//Already visited loop node, continue.
					case GridType.Bdy: continue;  
					//Found a bridge, check if direction should be added
					case GridType.Isl: 
						//Has not visited bridge before, add direction to it.
						if (CheckSelfVisit(ID, x,y, ref grid) == false) grid[position.x][position.y] |= visitDirection;
						break;
					default: throw new System.Exception("Should not happen. " + x + "_" + y);
				}
			}





		}
	}
}




/*

0 1 0 0 0 1
1 0 0 0 1 0
1 1 0 1 0 0
0 1 1 θ 1 0
0 0 0 1 0 1
1 1 0 0 1 1



n == grid.length
n == grid[i].length
1 <= n <= 500
grid[i][j] is either 0 or 1.

result 




 */