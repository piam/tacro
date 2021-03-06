({
    name:"&sect;",
    depends:["&Oslash;"],  
    axioms:[
        // TODO: this axiom is unnecessary, though it does force equal into 
        {Core:[[],[0,[1,[2],[3,0]]],[]],
         Skin:{TermNames:["&not;","&equals;","&Oslash;","&sect;"]}},
        {Core:[[],[0,[1,0,1],[1,[2,0],[2,1]]],[]],
         Skin:{TermNames:["&rarr;","&equals;","&sect;"]}},
        {Core:[[],[0,[1,[2,0],[2,1]],[1,0,1]],[]],
         Skin:{TermNames:["&rarr;","&equals;","&sect;"]}},
        {Core:[[],[0,[1,0,[0,[2,0,[3]],1]],[0,[1,2,[0,[1,0,[0,[2,0,2],1]],[1,0,[0,[2,0,[4,2]],1]]]],[1,0,1]]],[[1,2]]],
         Skin:{TermNames:["&rarr;","&forall;","&equals;","&Oslash;","&sect;"]}},
    ],
    goals:[
        {Core:[[],[0,[1,0,[1,1,[0,[2,1,[3]],[4,2,3]]]],[0,[1,0,[1,1,[0,[2,1,0],[4,2,4]]]],[0,[1,0,[1,1,[0,[2,1,[5,0]],[4,2,5]]]],[0,[1,0,[1,1,[0,[2,1,6],[4,2,7]]]],[0,3,[0,[1,0,[0,4,5]],7]]]]]],[[2,0],[3,1],[4,1],[5,1],[6,1],[7,1]]],
         Skin:{TermNames:["&rarr;","&forall;","&equals;","&Oslash;","&harr;","&sect;","&and;","&exist;"]}},
    ],
})
