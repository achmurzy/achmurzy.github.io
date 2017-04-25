
function buildFont(glyphData) //Take glyphs in the alphabet panel and write to opentype
      {
        var codex = [];
        alphabetPanel.group.selectAll("g").each(function(d, i) 
        {
          console.log("Adding glyph: " + i);
          d.glyph.index = i;
          codex.push(d.glyph);
        });

        if(codex.length > 0)
        {
          var font = new opentype.Font({
          familyName: 'OpenTypeSans',
          styleName: 'Medium',
          unitsPerEm: 1000,
          ascender: 800,
          descender: -200,
          glyphs: codex });
        
          console.log(font);

          fontJSON = JSON.stringify(font, function(key, value)
            {
              if(key === 'font')
                return undefined;
              return value;
            });
          
          if(/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))
            font.download();
        }
      }

//Here we will need functions for converting our alphabet table back into an opentype format 
//for conversion to a truetype font. 