({
    name:"&not;",
    depends:["&rarr;"],  
    axioms:[
        // ax3
        {Core:[[],[0,[0,[1,0],[1,1]],[0,1,0]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
    ],
    goals:[
        {Core:[[],[0,[1,0],[0,0,1]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[1,[1,0]],0],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,0,[1,[1,0]]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[0,0,1],[0,[1,1],[1,0]]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[1,[0,0,1]],[1,1]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[1,[0,0,1]],0],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,0,[0,[1,1],[1,[0,0,1]]]],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[0,[1,0],0],0],[]],
         Skin:{TermNames:["&rarr;","&not;"]}},
        {Core:[[],[0,[1,[1,0,0],[0,[1,1,1]]]],[]],
         Skin:{TermNames:["&not;","&rarr;"]}},
    ],
})
