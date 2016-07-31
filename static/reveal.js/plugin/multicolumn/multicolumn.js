// Perform multi-column formatting to the slides
(function() {
    // get the column declaration in $p
    function getColumnDecl($p) {
        var a = $p.find("a:first");
        var result = false;

        if(a.size() > 0) {
            result = a.text() == "!" && 
                    a.attr('href') &&
                    a.attr('href').startsWith("columns");
        }
        if(result) {
            return a;
        } else {
            return null;
        }
    }

    // get the column split in $p
    function isColumnSplit($p) {
        var a = $p.find("a:first");
        var result = false;
        if(a.size() > 0) {
            result = a.text() == "!" &&
                a.attr("href") &&
                a.attr("href").match(/split/);
        }
        return result;
    }

    function parseColumnWidths(cmd) {
        var widths = cmd.replace(/columns /, "").trim();
        return widths.split(/:/).map(function(x) {
            var w = parseInt(x, 10);
            return (1 <= w && w <= 12) ? w : 12;
        });
    }

    function makeRow(columns) {
        var row = $("<div>").addClass("row");

        for(var i=0; i < columns.length; i++) {
            var column = columns[i];
            var col = $("<div>").addClass("column col-md-" + column.width);
            column.children.forEach(function(x) {
                col.append(x);
            });
            row.append(col);
        }

        return row;
    }

    function process(section) {
        var children = $(section).children();
        var inColumn = null;
        var widths = null;

        // Get the column configuration
        // and collect the childrent should be distributed
        // into columns
        for(var i=0; i < children.length; i++) {
            var c = $(children[i]);
            var a = getColumnDecl(c);
            if(a) {
                c.detach();
                widths = parseColumnWidths(a.attr('href'));
                inColumn = children.slice(i+1);
                break;
            }
        }

        if(widths) {
            // Initalize the columns
            var columns = [];
            for(var i=0; i < widths.length; i++) {
                columns.push({
                    width: widths[i],
                    children: [],
                });
            }

            // Distribute the inColumn children into the
            // corresponding columns
            var col = 0;
            for(var i=0; i < inColumn.length; i++) {
                var $c = $(inColumn[i]).detach();

                if(isColumnSplit($c)) {
                    col = Math.min(widths.length-1, col + 1);
                } else {
                    columns[col].children.push($c);
                }
            }

            $(section).append(makeRow(columns));
        }
    }

    // Register reprocessing
    Reveal.addEventListener('slidechanged', function(event) {
        process(event.currentSlide);
    });

    process(Reveal.getCurrentSlide());
})();
