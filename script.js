const fields = document.querySelector("#fields");

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Piece {
    constructor(color, pos_x, pos_y) {
        this.color = color;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.name = this.color + `_${this.constructor.name}`;   // name of class
        this.defending_fields = [];
    }

    clear() {
        field[this.pos_x * 8 + this.pos_y].style.backgroundImage = null;
    }

    draw() {
        field[this.pos_x * 8 + this.pos_y].style.backgroundImage = `url("new_pieces/${this.name}.svg")`;
    }

    make_move(pos_x, pos_y) {
        this.clear();
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.draw();
    }

    check_move(pos_x, pos_y) {
        let pos_x_copy = this.pos_x;
        let pos_y_copy = this.pos_y;
        let field_copy = chess_game.field[pos_x][pos_y];
        let result = false;

        this.pos_x = pos_x;
        this.pos_y = pos_y;
        chess_game.field[pos_x][pos_y] = this;
        chess_game.field[pos_x_copy][pos_y_copy] = 0;

        for (let i = 0; i < chess_game.field.length; i++) {
            for (let j = 0; j < chess_game.field[i].length; j++) {
                if (chess_game.field[i][j]) {
                    chess_game.field[i][j].update_defending_fields();
                }
            }
        }

        let king;

        if (this.color === "white") {
            king = chess_game.get_king("white");
            if (!field_defended_by("black", king.pos_x, king.pos_y))
                result = true;
        }
        else {
            king = chess_game.get_king("black");
            if (!field_defended_by("white", king.pos_x, king.pos_y))
                result = true;
        }

        this.pos_x = pos_x_copy;
        this.pos_y = pos_y_copy;
        chess_game.field[pos_x][pos_y] = field_copy;
        chess_game.field[this.pos_x][this.pos_y] = this;

        for (let i = 0; i < chess_game.field.length; i++) {
            for (let j = 0; j < chess_game.field[i].length; j++) {
                if (chess_game.field[i][j]) {
                    chess_game.field[i][j].update_defending_fields();
                }
            }
        }

        return result;
    }
}

class Pawn extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
        this.long_move_turn = 0;
        this.en_passant = 0;
        this.en_passant_pawn = 0;
        this.en_passant_turn = 0;
    }

    show_move() {
        let possible_moves = [];

        // if pawn is white it moves up
        if (this.color === chess_game.turn) {
            if (this.color === "white") {

                // if pawn is not blocked by other piece
                if (!chess_game.field[this.pos_x - 1][this.pos_y]) {
                    if (this.check_move(this.pos_x - 1, this.pos_y))
                        possible_moves.push(new Pair(this.pos_x - 1, this.pos_y));

                    // if pawn has never moved and is not blocked by other piece

                    if (this.pos_x === 6 && !chess_game.field[this.pos_x - 2][this.pos_y]) {
                        if (this.check_move(this.pos_x - 2, this.pos_y))
                            possible_moves.push(new Pair(this.pos_x - 2, this.pos_y));
                    }
                }

                // if pawn can attack a piece
                if (this.pos_y - 1 >= 0 && chess_game.field[this.pos_x - 1][this.pos_y - 1]) {
                    if (chess_game.field[this.pos_x - 1][this.pos_y - 1].color === "black") {
                        if (this.check_move(this.pos_x - 1, this.pos_y - 1))
                            possible_moves.push(new Pair(this.pos_x - 1, this.pos_y - 1));
                    }
                }
                if (this.pos_y + 1 < 8 && chess_game.field[this.pos_x - 1][this.pos_y + 1]) {
                    if (chess_game.field[this.pos_x - 1][this.pos_y + 1].color === "black") {
                        if (this.check_move(this.pos_x - 1, this.pos_y + 1))
                            possible_moves.push(new Pair(this.pos_x - 1, this.pos_y + 1));
                    }
                }

                // if en passant

                if (this.pos_y - 1 >= 0 && chess_game.field[this.pos_x][this.pos_y - 1]) {
                    if (chess_game.field[this.pos_x][this.pos_y - 1] instanceof Pawn &&
                        chess_game.field[this.pos_x][this.pos_y - 1].long_move_turn === chess_game.turn_number - 1 &&
                        chess_game.field[this.pos_x][this.pos_y - 1].color === "black") {
                        if (this.check_move(this.pos_x - 1, this.pos_y - 1)) {
                            possible_moves.push(new Pair(this.pos_x - 1, this.pos_y - 1));
                            this.en_passant = new Pair(this.pos_x - 1, this.pos_y - 1);
                            this.en_passant_pawn = new Pair(this.pos_x, this.pos_y - 1);
                            this.en_passant_turn = chess_game.turn_number;
                        }
                    }
                }

                if (this.pos_y + 1 < 8 && chess_game.field[this.pos_x][this.pos_y + 1]) {
                    if (chess_game.field[this.pos_x][this.pos_y + 1] instanceof Pawn &&
                        chess_game.field[this.pos_x][this.pos_y + 1].long_move_turn === chess_game.turn_number - 1 &&
                        chess_game.field[this.pos_x][this.pos_y + 1].color === "black") {
                        if (this.check_move(this.pos_x - 1, this.pos_y + 1)) {
                            possible_moves.push(new Pair(this.pos_x - 1, this.pos_y + 1));
                            this.en_passant = new Pair(this.pos_x - 1, this.pos_y + 1);
                            this.en_passant_pawn = new Pair(this.pos_x, this.pos_y + 1);
                            this.en_passant_turn = chess_game.turn_number;
                        }
                    }
                }
            }


            // else pawn is black and it moves down

            else {

                // pawn is not blocked by other piece
                if (!chess_game.field[this.pos_x + 1][this.pos_y]) {
                    if (this.check_move(this.pos_x + 1, this.pos_y))
                        if (this.check_move(this.pos_x + 1, this.pos_y))
                            possible_moves.push(new Pair(this.pos_x + 1, this.pos_y));

                    // if pawn has never moved and is not blocked by other piece

                    if (this.pos_x === 1 && !chess_game.field[this.pos_x + 2][this.pos_y]) {
                        if (this.check_move(this.pos_x + 2, this.pos_y))
                            possible_moves.push(new Pair(this.pos_x + 2, this.pos_y));
                    }
                }
                // if pawn can attack a piece
                if (this.pos_y - 1 >= 0 && chess_game.field[this.pos_x + 1][this.pos_y - 1]) {
                    if (chess_game.field[this.pos_x + 1][this.pos_y - 1].color === "white") {
                        if (this.check_move(this.pos_x + 1, this.pos_y - 1))
                            possible_moves.push(new Pair(this.pos_x + 1, this.pos_y - 1));
                    }
                }
                if (this.pos_y + 1 < 8 && chess_game.field[this.pos_x + 1][this.pos_y + 1]) {
                    if (chess_game.field[this.pos_x + 1][this.pos_y + 1].color === "white") {
                        if (this.check_move(this.pos_x + 1, this.pos_y + 1))
                            possible_moves.push(new Pair(this.pos_x + 1, this.pos_y + 1));
                    }
                }

                // if en passant

                if (this.pos_y - 1 >= 0 && chess_game.field[this.pos_x][this.pos_y - 1]) {
                    if (chess_game.field[this.pos_x][this.pos_y - 1] instanceof Pawn &&
                        chess_game.field[this.pos_x][this.pos_y - 1].long_move_turn === chess_game.turn_number - 1 &&
                        chess_game.field[this.pos_x][this.pos_y - 1].color === "white") {
                        if (this.check_move(this.pos_x + 1, this.pos_y - 1)) {
                            possible_moves.push(new Pair(this.pos_x + 1, this.pos_y - 1));
                            this.en_passant = new Pair(this.pos_x + 1, this.pos_y - 1);
                            this.en_passant_pawn = new Pair(this.pos_x, this.pos_y - 1);
                            this.en_passant_turn = chess_game.turn_number;
                        }
                    }
                }

                if (this.pos_y + 1 < 8 && chess_game.field[this.pos_x][this.pos_y + 1]) {
                    if (chess_game.field[this.pos_x][this.pos_y + 1] instanceof Pawn &&
                        chess_game.field[this.pos_x][this.pos_y + 1].long_move_turn === chess_game.turn_number - 1 &&
                        chess_game.field[this.pos_x][this.pos_y + 1].color === "white") {
                        if (this.check_move(this.pos_x + 1, this.pos_y + 1)) {
                            possible_moves.push(new Pair(this.pos_x + 1, this.pos_y + 1));
                            this.en_passant = new Pair(this.pos_x + 1, this.pos_y + 1);
                            this.en_passant_pawn = new Pair(this.pos_x, this.pos_y + 1);
                            this.en_passant_turn = chess_game.turn_number;
                        }
                    }
                }
            }
        }
        return possible_moves;
    }

    update_defending_fields() {
        this.defending_fields.splice(0, this.defending_fields.length);

        if (this.color === "white") {
            if (this.pos_x - 1 >= 0) {
                if (this.pos_y - 1 >= 0) {
                    this.defending_fields.push(new Pair(this.pos_x - 1, this.pos_y - 1));
                }
                if (this.pos_y + 1 < 8) {
                    this.defending_fields.push(new Pair(this.pos_x - 1, this.pos_y + 1));
                }
            }
        }
        else {
            if (this.pos_x + 1 < 8) {
                if (this.pos_y - 1 >= 0) {
                    this.defending_fields.push(new Pair(this.pos_x + 1, this.pos_y - 1));
                }
                if (this.pos_y + 1 < 8) {
                    this.defending_fields.push(new Pair(this.pos_x + 1, this.pos_y + 1));
                }
            }
        }
    }
}

class Rook extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
        this.can_castle = true;
    }

    show_move() {
        let possible_moves = [];

        // if rook does not move beyond the chess board
        if (this.color === chess_game.turn) {
            for (let i = 0; i < this.defending_fields.length; i++) {
                if (!chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y] ||
                    chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y].color !== this.color) {
                    if (this.check_move(this.defending_fields[i].x, this.defending_fields[i].y))
                        possible_moves.push(new Pair(this.defending_fields[i].x, this.defending_fields[i].y));
                }
            }
        }

        return possible_moves;
    }

    update_defending_fields() {

        this.defending_fields.splice(0, this.defending_fields.length);
        let x = this.pos_x;
        let y = this.pos_y;

        // if rook does not move beyond the chess board

        while (x + 1 < 8) {
            x++;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        x = this.pos_x;

        while (x - 1 >= 0) {
            x--;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        x = this.pos_x;

        while (y + 1 < 8) {
            y++;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        y = this.pos_y;

        while (y - 1 >= 0) {
            y--;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }
    }
}

class Knight extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
    }

    show_move() {
        let possible_moves = [];
        // if knight does not go beyond chess board

        if (this.color === chess_game.turn) {
            for (let i = 0; i < this.defending_fields.length; i++) {
                if (!chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y] ||
                    chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y].color !== this.color) {
                    if (this.check_move(this.defending_fields[i].x, this.defending_fields[i].y))
                        possible_moves.push(new Pair(this.defending_fields[i].x, this.defending_fields[i].y));
                }
            }
        }

        return possible_moves;
    }

    update_defending_fields() {
        this.defending_fields.splice(0, this.defending_fields.length);
        if (this.pos_x + 2 < 8) {
            if (this.pos_y + 1 < 8) {
                this.defending_fields.push(new Pair(this.pos_x + 2, this.pos_y + 1));
            }
            if (this.pos_y - 1 >= 0) {
                this.defending_fields.push(new Pair(this.pos_x + 2, this.pos_y - 1));
            }
        }
        if (this.pos_x - 2 >= 0) {
            if (this.pos_y + 1 < 8) {
                this.defending_fields.push(new Pair(this.pos_x - 2, this.pos_y + 1));
            }
            if (this.pos_y - 1 >= 0) {
                this.defending_fields.push(new Pair(this.pos_x - 2, this.pos_y - 1));
            }
        }

        if (this.pos_y + 2 < 8) {
            if (this.pos_x + 1 < 8) {
                this.defending_fields.push(new Pair(this.pos_x + 1, this.pos_y + 2));
            }
            if (this.pos_x - 1 >= 0) {
                this.defending_fields.push(new Pair(this.pos_x - 1, this.pos_y + 2));
            }
        }

        if (this.pos_y - 2 >= 0) {
            if (this.pos_x + 1 < 8) {
                this.defending_fields.push(new Pair(this.pos_x + 1, this.pos_y - 2));
            }
            if (this.pos_x - 1 >= 0) {
                this.defending_fields.push(new Pair(this.pos_x - 1, this.pos_y - 2));
            }
        }
    }
}

class Bishop extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
    }

    show_move() {
        let possible_moves = [];

        if (this.color === chess_game.turn) {
            for (let i = 0; i < this.defending_fields.length; i++) {
                if (!chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y] ||
                    chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y].color !== this.color) {
                    if (this.check_move(this.defending_fields[i].x, this.defending_fields[i].y))
                        possible_moves.push(new Pair(this.defending_fields[i].x, this.defending_fields[i].y));
                }
            }
        }

        return possible_moves;
    }

    update_defending_fields() {
        let x = this.pos_x;
        let y = this.pos_y;

        this.defending_fields.splice(0, this.defending_fields.length);

        // if bishop does not move beyond the chess board

        while (x + 1 < 8 && y + 1 < 8) {
            x++;
            y++;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        x = this.pos_x;
        y = this.pos_y;

        while (x + 1 < 8 && y - 1 >= 0) {
            x++;
            y--;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        x = this.pos_x;
        y = this.pos_y;

        while (x - 1 >= 0 && y + 1 < 8) {
            x--;
            y++;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }

        x = this.pos_x;
        y = this.pos_y;

        while (x - 1 >= 0 && y - 1 >= 0) {
            x--;
            y--;
            this.defending_fields.push(new Pair(x, y));
            if (chess_game.field[x][y]) {
                break;
            }
        }
    }
}

class Queen extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
    }

    show_move() {
        let possible_moves = [];

        if (this.color === chess_game.turn) {
            for (let i = 0; i < this.defending_fields.length; i++) {
                if (!chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y] ||
                    chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y].color !== this.color) {
                    if (this.check_move(this.defending_fields[i].x, this.defending_fields[i].y))
                        possible_moves.push(new Pair(this.defending_fields[i].x, this.defending_fields[i].y));
                }
            }
        }

        return possible_moves;
    }

    update_defending_fields() {
        this.defending_fields.splice(0, this.defending_fields.length);

        let rook = new Rook(this.color, this.pos_x, this.pos_y);
        let bishop = new Bishop(this.color, this.pos_x, this.pos_y);

        rook.update_defending_fields();
        bishop.update_defending_fields();

        this.defending_fields = bishop.defending_fields;
        for (let i = 0; i < rook.defending_fields.length; i++) {
            this.defending_fields.push(rook.defending_fields[i]);
        }
    }

}

class King extends Piece {
    constructor(color, pos_x, pos_y) {
        super(color, pos_x, pos_y);
        // this.name = this.color + "_king";
        this.can_castle = true;
    }

    show_move() {
        let possible_moves = [];
        let enemy_color = Chess_game.get_enemy_color(this.color);

        if (this.color === chess_game.turn) {
            for (let i = 0; i < this.defending_fields.length; i++) {
                if (!chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y] ||
                    chess_game.field[this.defending_fields[i].x][this.defending_fields[i].y].color !== this.color) {
                    if (this.check_move(this.defending_fields[i].x, this.defending_fields[i].y))
                        possible_moves.push(new Pair(this.defending_fields[i].x, this.defending_fields[i].y));
                }
            }
            if (this.can_castle && !field_defended_by(enemy_color, this.pos_x, this.pos_y)) {
                if (chess_game.field[this.pos_x][0].can_castle &&
                    !chess_game.field[this.pos_x][1] && !field_defended_by(enemy_color, this.pos_x, 1) &&
                    !chess_game.field[this.pos_x][2] && !field_defended_by(enemy_color, this.pos_x, 2) &&
                    !chess_game.field[this.pos_x][3] && !field_defended_by(enemy_color, this.pos_x, 3)
                ) {
                    possible_moves.push(new Pair(this.pos_x, 2));
                }
                if (chess_game.field[this.pos_x][7].can_castle &&
                    !chess_game.field[this.pos_x][5] && !field_defended_by(enemy_color, this.pos_x, 5) &&
                    !chess_game.field[this.pos_x][6] && !field_defended_by(enemy_color, this.pos_x, 6)
                ) {
                    possible_moves.push(new Pair(this.pos_x, 6));
                }
            }
        }
        return possible_moves;
    }

    update_defending_fields() {
        this.defending_fields.splice(0, this.defending_fields.length);
        for (let x = this.pos_x - 1; x < this.pos_x + 2; x++) {
            for (let y = this.pos_y - 1; y < this.pos_y + 2; y++) {
                if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                    this.defending_fields.push(new Pair(x, y));
                }
            }
        }
    }

}

class Chess_game {
    constructor() {
        this.field = [[new Rook("black", 0, 0), new Knight("black", 0, 1), new Bishop("black", 0, 2), new Queen("black", 0, 3), new King("black", 0, 4), new Bishop("black", 0, 5), new Knight("black", 0, 6), new Rook("black", 0, 7)],
            [new Pawn("black", 1, 0), new Pawn("black", 1, 1), new Pawn("black", 1, 2), new Pawn("black", 1, 3), new Pawn("black", 1, 4), new Pawn("black", 1, 5), new Pawn("black", 1, 6), new Pawn("black", 1, 7)],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [new Pawn("white", 6, 0), new Pawn("white", 6, 1), new Pawn("white", 6, 2), new Pawn("white", 6, 3), new Pawn("white", 6, 4), new Pawn("white", 6, 5), new Pawn("white", 6, 6), new Pawn("white", 6, 7)],
            [new Rook("white", 7, 0), new Knight("white", 7, 1), new Bishop("white", 7, 2), new Queen("white", 7, 3), new King("white", 7, 4), new Bishop("white", 7, 5), new Knight("white", 7, 6), new Rook("white", 7, 7)]];

        this.is_showing_moves = false;
        this.possible_moves = [];
        this.selected_piece = new Pair(0, 0);
        this.is_showing_transform = false;

        this.turn = "white";
        this.turn_number = 0;

        this.move_type = '';    // for sounds
        this.game_over = '';
    }

    show_move(x, y) {
        let possible_moves = [];

        if (this.field[x][y]) {
            possible_moves = this.field[x][y].show_move();
            for (let i = 0; i < possible_moves.length; i++) {
                // if it is not piece
                if (!this.field[possible_moves[i].x][possible_moves[i].y]) {

                    // checking if there was en passant

                    if (this.field[x][y] instanceof Pawn &&
                        possible_moves[i].x === this.field[x][y].en_passant.x &&
                        possible_moves[i].y === this.field[x][y].en_passant.y &&
                        this.field[x][y].en_passant_turn === this.turn_number) {
                        game_field[possible_moves[i].x][possible_moves[i].y].classList.add("bg-danger");
                    }

                    // else it is just an empty field

                    else {
                        game_field[possible_moves[i].x][possible_moves[i].y].classList.add("move");
                    }
                }
                // else it is piece
                else {
                    game_field[possible_moves[i].x][possible_moves[i].y].classList.add("bg-danger");
                }
            }
            this.is_showing_moves = possible_moves.length;
            this.selected_piece = new Pair(x, y);
        }
        return possible_moves;    // returning possible moves
    }

    make_move(x0, y0, x1, y1) {

        if (!this.field[x1][y1]) {      // moving to an empty field
            if (this.field[x0][y0] instanceof Pawn) {
                if (x1 - x0 === 2 || x0 - x1 === 2) {   // data for en passant move
                    this.field[x0][y0].long_move_turn = this.turn_number;
                }
            }

            // checking if there was en passant

            if (this.field[x0][y0] instanceof Pawn &&
                x1 === this.field[x0][y0].en_passant.x &&
                y1 === this.field[x0][y0].en_passant.y &&
                this.field[x0][y0].en_passant_turn === this.turn_number) {
                this.field[this.field[x0][y0].en_passant_pawn.x][this.field[x0][y0].en_passant_pawn.y].clear();
                delete this.field[this.field[x0][y0].en_passant_pawn.x][this.field[x0][y0].en_passant_pawn.y];
                this.field[this.field[x0][y0].en_passant_pawn.x][this.field[x0][y0].en_passant_pawn.y] = 0;
            }

            if (this.field[x0][y0] instanceof King) {
                if (Math.abs(y1 - y0) > 1) {
                    if (y1 === 2) {
                        this.field[x0][0].make_move(x0, 3);
                        this.field[x0][3] = this.field[x0][0];
                        this.field[x0][0] = 0;
                    }
                    if (y1 === 6) {
                        this.field[x0][7].make_move(x0, 5);
                        this.field[x0][5] = this.field[x0][7];
                        this.field[x0][7] = 0;
                    }
                }
            }
            this.move_type = 'move';
        }
        else {      //  else attacking another piece
            this.move_type = 'capture';
        }

        this.field[x0][y0].make_move(x1, y1);
        this.field[x1][y1] = this.field[x0][y0];
        this.field[x0][y0] = 0;

        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j]) {
                    this.field[i][j].update_defending_fields();
                }
            }
        }

        // if king or rook moved, it can not castle anymore

        if (this.field[x1][y1] instanceof King || this.field[x1][y1] instanceof Rook) {
            this.field[x1][y1].can_castle = false;
        }

        // if pawn is on last horizontal

        if (this.field[x1][y1] instanceof Pawn) {
            if (x1 === 0) {
                this.transform_pawn_choice(x1, y1, [0, 1, 2, 3]);
            }
            if (x1 === 7) {
                this.transform_pawn_choice(x1, y1, [7, 6, 5, 4]);
            }
        }

        if(document.querySelector(".check"))
            document.querySelector(".check").classList.remove("check");

        this.next_turn();

        if (this.check(this.turn)) {
            this.move_type = 'check';
            let king = this.get_king(this.turn);
            game_field[king.pos_x][king.pos_y].classList.add("check");
        }

        if (!this.checkmate_stalemate(this.turn)) {
            this.draw()
        }

        if(this.game_over) {
            this.move_type = 'game_over';
        }

        this.play_sound();

        this.is_showing_moves = false;
    }

    remove_move() {
        let possible_moves = document.querySelectorAll(".move");
        for (let i = 0; i < possible_moves.length; i++) {
            possible_moves[i].classList.remove("move");
        }
        possible_moves = document.querySelectorAll(".bg-danger");
        for (let i = 0; i < possible_moves.length; i++) {
            possible_moves[i].classList.remove("bg-danger");
        }
        this.is_showing_moves = false;
    }

    transform_pawn(x, y, piece) {
        if (piece === "queen")
            this.field[x][y] = new Queen(this.field[x][y].color, x, y);
        if (piece === "rook")
            this.field[x][y] = new Rook(this.field[x][y].color, x, y);
        if (piece === "bishop")
            this.field[x][y] = new Bishop(this.field[x][y].color, x, y);
        if (piece === "knight")
            this.field[x][y] = new Knight(this.field[x][y].color, x, y);
        this.field[x][y].update_defending_fields();
        this.is_showing_transform = false;
    }

    transform_pawn_choice(x, y, arr) {
        this.is_showing_transform = true;

        game_field[arr[0]][y].style.backgroundImage = `url("new_pieces/${this.field[x][y].color}_queen.svg")`;
        game_field[arr[1]][y].style.backgroundImage = `url("new_pieces/${this.field[x][y].color}_rook.svg")`;
        game_field[arr[2]][y].style.backgroundImage = `url("new_pieces/${this.field[x][y].color}_bishop.svg")`;
        game_field[arr[3]][y].style.backgroundImage = `url("new_pieces/${this.field[x][y].color}_knight.svg")`;

        game_remove_listeners();

        for (let i = 0; i < 4; i++) {
            game_field[arr[i]][y].classList.add("pawn_transformation");
            game_field[arr[i]][y].addEventListener("click", () => {
                if (i === 0) {
                    this.transform_pawn(x, y, "queen");
                }
                if (i === 1) {
                    this.transform_pawn(x, y, "rook");
                }
                if (i === 2) {
                    this.transform_pawn(x, y, "bishop");
                }
                if (i === 3) {
                    this.transform_pawn(x, y, "knight");
                }
                game_remove_listeners();
                this.is_showing_moves = false;

                for (let i = 0; i < 4; i++) {
                    game_field[arr[i]][y].style.backgroundImage = null;
                    if (this.field[arr[i]][y]) {
                        this.field[arr[i]][y].draw();
                    }
                    game_field[arr[i]][y].classList.remove("pawn_transformation");
                }
            });
        }
    }

    next_turn() {
        if (this.turn === "white")
            this.turn = "black";
        else
            this.turn = "white";
        this.turn_number++;
    }

    check(color) {
        let king = this.get_king(color);
        return field_defended_by(Chess_game.get_enemy_color(color), king.pos_x, king.pos_y);
    }

    checkmate_stalemate(color) {
        let turn = this.turn;
        this.turn = color;
        let king = this.get_king(color);

        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j]) {
                    if (this.field[i][j].color === king.color) {
                        if (this.field[i][j].show_move().length) {
                            this.game_over = "";
                            this.turn = turn;
                            return false;
                        }
                    }
                }
            }
        }

        let enemy_color = Chess_game.get_enemy_color(king.color);
        if (field_defended_by(enemy_color, king.pos_x, king.pos_y))
            this.game_over = `${king.color} checkmate`;
        else
            this.game_over = `${king.color} stalemate`;
        this.turn = turn;
        return true;
    }

    draw() {
        this.game_over = "draw by insufficient material";
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j] && !(this.field[i][j] instanceof King)) {
                    this.game_over = "";
                    return false;
                }
            }
        }
        return true;
    }

    get_king(color) {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j] && this.field[i][j] instanceof King && this.field[i][j].color === color) {
                    return this.field[i][j];
                }
            }
        }
    }

    play_sound() {
        $.playSound(`sounds/${this.move_type}.wav`);
    }

    static get_enemy_color(color) {
        if (color === "white")
            return "black";
        else
            return "white";
    }
}

let chess_game = new Chess_game();

initial_draw_chessboard();

let field = document.querySelectorAll(".field");

let game_field = array_chunk(field, 8);

initial_draw_pieces();
game_interface();

function initial_draw_chessboard() {
    let inner = "";
    let light_field = `<div class="field col field-white"></div>`;
    let dark_field = `<div class="field col field-black"></div>`;
    for (let i = 0; i < 8; i++) {
        inner += `<div class="row no-gutters">`;
        if (i % 2)
            for (let j = 0; j < 8; j++)
                if (j % 2)
                    inner += `${light_field}`;
                else
                    inner += `${dark_field}`;
        else
            for (let j = 0; j < 8; j++)
                if (j % 2)
                    inner += `${dark_field}`;
                else
                    inner += `${light_field}`;
        inner += `</div>`
    }
    fields.innerHTML = inner;
}

function initial_draw_pieces() {
    for (let i = 0; i < chess_game.field.length; i++)
        for (let j = 0; j < chess_game.field[i].length; j++)
            if (chess_game.field[i][j]) {
                chess_game.field[i][j].draw();
                chess_game.field[i][j].update_defending_fields();
            }
}

function array_chunk(input, size) {     // to create a two-dimensional array
    let x, i = 0, c = -1, l = input.length, n = [];
    for (; i < l; i++) {
        (x = i % size) ? n[c][x] = input[i] : n[++c] = [input[i]];
    }
    return n;
}

function game_interface() {
    if (chess_game.is_showing_transform) {
        for (let i = 0; i < game_field.length; i++) {
            for (let j = 0; j < game_field[i].length; j++)
                game_field[i][j].addEventListener("click", function () {
                    game_interface();
                });
        }
    }
    if (!chess_game.is_showing_moves) {
        for (let i = 0; i < game_field.length; i++) {
            for (let j = 0; j < game_field[i].length; j++) {
                game_field[i][j].addEventListener("click", function () {
                    chess_game.possible_moves = chess_game.show_move(i, j);
                    game_remove_listeners();
                    game_interface();
                })
            }
        }
    }
    if (chess_game.is_showing_moves) {
        for (let i = 0; i < game_field.length; i++) {
            for (let j = 0; j < game_field[i].length; j++) {
                game_field[i][j].addEventListener("click", function () {
                    if (chess_game.possible_moves.find(function (element) {
                        return element.x === i && element.y === j;
                    })) {
                        chess_game.remove_move();
                        chess_game.make_move(chess_game.selected_piece.x, chess_game.selected_piece.y, i, j);
                        if (!chess_game.is_showing_transform)
                            game_remove_listeners();
                        game_interface();
                    }
                    else {
                        chess_game.remove_move();
                        game_remove_listeners();
                        if (chess_game.field[i][j]) {
                            chess_game.possible_moves = chess_game.show_move(i, j);
                        }
                        game_interface();
                    }
                })
            }
        }
    }

    if (chess_game.game_over) {
        game_remove_listeners();
        alert(chess_game.game_over);
    }

}

function game_remove_listeners() {
    let old_elements = document.querySelectorAll(".field");
    let new_elements = [];
    for (let i = 0; i < old_elements.length; i++) {
        new_elements[i] = old_elements[i].cloneNode(true);
        old_elements[i].parentNode.replaceChild(new_elements[i], old_elements[i]);
    }
    field = document.querySelectorAll(".field");
    game_field = array_chunk(field, 8);
}

function field_defended_by(color, x, y) {
    for (let i = 0; i < chess_game.field.length; i++) {
        for (let j = 0; j < chess_game.field[i].length; j++) {
            if (chess_game.field[i][j]) {
                if (chess_game.field[i][j].color === color) {
                    if (chess_game.field[i][j].defending_fields.find(function (element) {
                        return element.x === x && element.y === y;
                    })) {
                        return true;
                    }
                }
            }
        }
    }
}